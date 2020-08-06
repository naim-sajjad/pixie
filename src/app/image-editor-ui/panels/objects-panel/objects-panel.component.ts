import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ObjectListService} from '../../../image-editor/objects/object-list.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {Object} from 'fabric/fabric-impl';
import {EditorControlsService} from '../../toolbar-controls/editor-controls.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CanvasStateService} from '../../../image-editor/canvas/canvas-state.service';
import {Select, Store} from '@ngxs/store';
import {EditorState} from '../../../image-editor/state/editor-state';
import {OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {ObjectNames} from '../../../image-editor/objects/object-names.enum';
import {Observable} from 'rxjs';
import {AffectsToolService} from '../../../image-editor/tools/affects/affects-tool.service';
import {CanvasService} from '../../../image-editor/canvas/canvas.service';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';
import {EraserToolService} from '../../../image-editor/tools/eraser/eraser-tool.service';

@Component({
    selector: 'objects-panel',
    templateUrl: './objects-panel.component.html',
    styleUrls: ['./objects-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {'class': 'controls-drawer'},
})

export class ObjectsPanelComponent {
    @Select(EditorState.activeObjId) activeObjId$: Observable<string>;

    public hue: number = 0;
    public saturation: number = 0;
    public opacity: number = 0.5;
    public brightness: number = 0;   
    public contrast: number = 0;   
    public saturationDisabled: boolean = true;
    public hueDisabled: boolean = true;
    public opacityDisabled: boolean = true;
    public brightnessDisabled: boolean = true;
    public contrastDisabled: boolean = true;
    public blendDisabled: boolean = true;
    public tollbarActive: string = "tone";
    public blendColor: string = "#00f900";
    public blendMode: string = 'add';
    public blendOpacity: number = 1;
    public eraserSize: number = 0.5;
    public eraserStrength: number = 20;
    public eraserHarshness: number = 1;
    public eraserRevert: boolean = false; 
    public drawing: boolean = false;
    public drawingMode: string = "add";
    public pencilWidth: number = 25;
    public fillColor = "rgba(255,0,0,.5)";
    public filters: string[] = ['grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
    'brightness', 'contrast', 'saturation', 'noise', 'vintage',
    'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
    'polaroid', 'blend-color', 'gamma', 'kodachrome',
    'blackwhite', 'blend-image', 'hue', 'resize'];
    constructor(
        public objects: ObjectListService,
        public panelRef: OverlayPanelRef,
        private controls: EditorControlsService,
        private canvasState: CanvasStateService,
        public affectTool: AffectsToolService,
        private store: Store,
        private canvas: CanvasService,
        private activeObject: ActiveObjectService,
        public eraserTool: EraserToolService,
        ) {
      this.init();
  }
  public init() {

      this.canvasState.fabric.isDrawingMode = true;
      this.canvasState.fabric.freeDrawingBrush.width = this.eraserStrength;
    this.canvasState.fabric.on('path:created', opt => {
     opt.path.globalCompositeOperation = 'destination-out';
     opt.path.lineWidth = this.eraserStrength;
     
     this.canvas.render();
 });
    /* this.eraserTool.enable();*/

}
private getClientCoords(e: MouseEvent|TouchEvent) {
    let clientX = 0,
    clientY = 0;

    e = e as TouchEvent;

    if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e['clientX'];
        clientY = e['clientY'];
    }

    return {x:clientX, y:clientY};
}
public getIcon(object: Object): string {
    return ObjectNames[object.name].icon;
}

public selectObject(object: Object) {

    this.objects.select(object);
    if ( ! this.store.selectSnapshot(EditorState.dirty)) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
    }
}

public getObjectDisplayName(object: Object): string {
    const name = object.name;

    return name ? name.replace(/([A-Z])/g, ' $1') : '';
}

public reorderObjects(e: CdkDragDrop<string>) {
    moveItemInArray(this.objects.getAll(), e.previousIndex, e.currentIndex);

        // pixie and canvas object orders are reversed, need to
        // reverse newIndex given by cdk drag and drop
        const index = this.objects.getAll()
        .slice().reverse().findIndex(obj => obj.data.id === e.item.data);

        this.objects.getById(e.item.data).moveTo(index);
        this.canvasState.fabric.requestRenderAll();
    }

    public shouldDisableObject(object: Object): boolean {
        return !object.selectable && object.name !== ObjectNames.drawing.name;
    }
    public setTollbar(type: string)
    {
        this.tollbarActive = type;
        if(type == "eraser")
        {
          this.affectTool.enableEraser();
      }
  }
  public getTollbar(type: string)
  {
    if(this.tollbarActive == type)
    {
        return true;
    }
    else
    {
        return false;
    }
}
public applyAffects(e: any, affect: string) {
    let rangeVal = 0;
    var obj = this.activeObject.get();
    if(affect == "hue")
    {
        this.hueDisabled = !e.target.checked;
        rangeVal = this.hue;
    }
    else if (affect == "saturation")
    {
        this.saturationDisabled = !e.target.checked;
        rangeVal = this.saturation;
    }
    else if (affect == "brightness")
    {
        this.brightnessDisabled = !e.target.checked;
        rangeVal = this.brightness;
    }
    else if (affect == "opacity")
    {
        this.opacityDisabled = !e.target.checked;
        rangeVal = this.opacity;
    }
    else if (affect == "contrast")
    {
        this.contrastDisabled = !e.target.checked;
        rangeVal = this.contrast;

    }

    if(e.target.checked)
    {

        this.affectTool.apply(this.filters.indexOf(affect), affect,rangeVal,obj);
    }
    else
    {
        if(affect == "opacity")
        {
         this.affectTool.apply(this.filters.indexOf(affect), affect,1,obj);
     }
     else{
        this.affectTool.apply(this.filters.indexOf(affect), affect,0,obj); 
    }
}

}
public applyBlend(e: any, affect: string) {
    var obj = this.activeObject.get();
    if(affect == 'blend')
    {
        if(e.target.checked)
            this.blendDisabled = false;   
        else
        {
         this.blendDisabled = true;  
     }
 }

 if(!this.blendDisabled)
 {
    this.affectTool.applyBlendMode(this.filters.indexOf('blend-color'),this.blendColor,this.blendMode,this.blendOpacity,obj); 
}
}
public applyEraser(e: any, affect: string) {

}
public applyRangeValue(e: any, affect: string) {
 var obj = this.activeObject.get();
 this.affectTool.apply(this.filters.indexOf(affect), affect,e.target.value, obj);
}
}
