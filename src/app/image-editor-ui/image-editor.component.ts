import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CanvasService} from '../image-editor/canvas/canvas.service';
import {HistoryToolService} from '../image-editor/history/history-tool.service';
import {fromEvent, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {EditorControlsService} from './toolbar-controls/editor-controls.service';
import {FloatingPanelsService} from './toolbar-controls/floating-panels.service';
import {CanvasKeybindsService} from '../image-editor/canvas/canvas-keybinds.service';
import {ActiveObjectService} from '../image-editor/canvas/active-object/active-object.service';
import {CanvasStateService} from '../image-editor/canvas/canvas-state.service';
import {Settings} from '@common/core/config/settings.service';
import {Select, Store} from '@ngxs/store';
import {ObjectDeselected, ObjectSelected, OpenPanel} from '../image-editor/state/editor-state-actions';
import {EditorState} from '../image-editor/state/editor-state';
import {NavPosition} from '../image-editor/enums/control-positions.enum';
import {DrawerName} from './toolbar-controls/drawers/drawer-name.enum';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {Localization} from '@common/core/types/models/Localization';
import {Translations} from '@common/core/translations/translations.service';
import {EditorMode} from '../image-editor/enums/editor-mode.enum';
import {UploadedFile} from '@common/uploads/uploaded-file';
import {UploadInputTypes} from '@common/uploads/upload-input-config';
import {ImportToolService} from '../image-editor/tools/import/import-tool.service';
import {fabric} from 'fabric';
import {normalizeObjectProps} from '../image-editor/utils/normalize-object-props';
import {randomString} from '@common/core/utils/random-string';
import {CanvasZoomService} from '../image-editor/canvas/canvas-zoom.service';
import {CanvasPanService} from '../image-editor/canvas/canvas-pan.service';
import {ImageEditorService} from '../image-editor/image-editor.service';

@Component({
    selector: 'image-editor',
    templateUrl: './image-editor.component.html',
    styleUrls: ['./image-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ImageEditorComponent implements OnInit {
    @Select(EditorState.navPosition) navPosition$: Observable<NavPosition>;
    @Select(EditorState.toolbarHidden) toolbarHidden$: Observable<boolean>;
    @Select(EditorState.contentLoaded) contentLoaded$: Observable<boolean>;
    @ViewChild('canvasWrapper', {static: true}) canvasWrapper: ElementRef;
    @ViewChild('canvasMaskWrapper', {static: true}) canvasMaskWrapper: ElementRef;

    @HostBinding('class.nav-hidden') get navHidden() {
        return this.store.selectSnapshot(EditorState.navPosition) === NavPosition.NONE;
    }

    public dropzoneConfig = {types: [UploadInputTypes.image]};

    constructor(
        public canvas: CanvasService,
        private history: HistoryToolService,
        public controls: EditorControlsService,
        public breakpoints: BreakpointsService,
        private floatingPanels: FloatingPanelsService,
        private canvasKeybinds: CanvasKeybindsService,
        private el: ElementRef<HTMLElement>,
        private activeObject: ActiveObjectService,
        private state: CanvasStateService,
        public config: Settings,
        private store: Store,
        private i18n: Translations,
        private importTool: ImportToolService,
        private zoom: CanvasZoomService,
        private pan: CanvasPanService,
        private imageEditor: ImageEditorService,
    ) {}

    ngOnInit() {
        this.state.wrapperEl = this.canvasWrapper.nativeElement;
        this.state.maskWrapperEl = this.canvasMaskWrapper.nativeElement;

        // update editor language on settings change
        this.config.all$()
            .pipe(
                map(config => config.pixie.languages.active),
                distinctUntilChanged(),
            ).subscribe(() => {
                this.setLocalization();
            });

        this.initFabric().subscribe(() => {
            this.activeObject.init();
            this.canvasKeybinds.init();
            this.fitCanvasToScreenOnResize();
            this.openObjectSettingsOnDoubleClick();
            this.closePanelsOnObjectDelete();
            this.handleObjectSelection();
            this.updateHistoryOnObjectModification();
            this.bindToClickOutsideCanvas();
            this.ignoreMobileKeyboard();
            this.canvasMaskWrapper.nativeElement.classList.remove('not-loaded');
        });
    }

    private initFabric(): Observable<any> {
        const canvasEl = document.querySelector('#pixie-canvas') as HTMLCanvasElement;
        this.state.fabric = new fabric.Canvas(canvasEl);

        this.state.fabric.selection = false;
        this.state.fabric.renderOnAddRemove = false;

        const textureSize = this.config.get('pixie.textureSize');
        if (textureSize) fabric['textureSize'] = textureSize;

        const objectDefaults = normalizeObjectProps(
            this.config.get('pixie.objectDefaults.global')
        );

        for (const key in objectDefaults) {
            fabric.Object.prototype[key] = objectDefaults[key];
        }

        // add ID to all objects
        this.state.fabric.on('object:added', e => {
            if (e.target.data && e.target.data.id) return;
            if ( ! e.target.data) e.target.data = {};
            e.target.data.id = randomString(10);
        });

        this.pan.init();
        this.zoom.init();

        this.imageEditor.loadInitialContent()
            .then(() => this.state.loaded.next(true));

        return this.state.loaded;
    }

    private closePanelsOnObjectDelete() {
        this.canvas.fabric().on('object:delete', () => this.controls.closeCurrentPanel());
    }

    private openObjectSettingsOnDoubleClick() {
        this.canvas.fabric().on('mouse:dblclick', () => {
            if (!this.activeObject.getId() || this.store.selectSnapshot(EditorState.dirty)) return;
            this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        });
    }

    /**
     * Replace current history item, so object position is
     * updated after object is scaled, moved or rotated.
     */
    private updateHistoryOnObjectModification() {
        this.canvas.fabric().on('object:modified', event => {
            if (!event.e || this.store.selectSnapshot(EditorState.dirty)) return;
            this.history.replaceCurrent();
        });
    }

    private handleObjectSelection() {
        this.canvas.fabric().on('selection:created', e => this.onObjectSelection(e));
        this.canvas.fabric().on('selection:updated', e => this.onObjectSelection(e));

        this.canvas.fabric().on('selection:cleared', fabricEvent => {
            this.store.dispatch(new ObjectDeselected(fabricEvent.e != null));
        });
    }

    public onObjectSelection(fabricEvent) {
        this.store.dispatch(new ObjectSelected(
            fabricEvent.target.name, fabricEvent.e != null
        ));
    }

    private fitCanvasToScreenOnResize() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => {
                this.canvas.zoom.fitToScreen();
            });
    }

    private setLocalization() {
        const active = this.config.get('pixie.languages.active', 'default');
        if (active === 'default') return;

        if ( ! this.config.get('i18n.enable')) {
            this.config.set('i18n.enable', true);
        }

        const lines = this.config.get(`pixie.languages.custom.${active}`);
        this.i18n.setLocalization({
            name: active,
            model: new Localization({name: active}),
            lines: lines,
        });
    }

    private bindToClickOutsideCanvas() {
        this.state.wrapperEl.addEventListener('click', e => {
            // deselect active object when user clicks outside canvas
            if ((e.target as HTMLElement).nodeName.toLowerCase() !== 'canvas') {
                this.activeObject.deselect();
            }
        });
    }

    private ignoreMobileKeyboard() {
        if (this.config.get('pixie.ui.ignoreMobileKeyboard')) {
            this.breakpoints.isMobile$.pipe(filter(result => !!result), take(1))
                .subscribe(() => {
                    let minHeight = this.el.nativeElement.offsetHeight;
                    if (this.config.get('pixie.ui.mode') === EditorMode.OVERLAY) {
                        minHeight -= 40; // overlay mode gutter
                    }
                    this.el.nativeElement.style.minHeight = minHeight + 'px';
                });
        }
    }

    public onFileDropped(files: UploadedFile[]) {
        const openAsBackground = this.config.get('pixie.tools.import.openDroppedImageAsBackground');
        this.importTool.loadFile(files[0], {openAsBackground}).then(image => {
            image && this.activeObject.select(image);
        });
    }
}
