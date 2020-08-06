import {Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {CropToolService} from '../../../image-editor/tools/crop/crop-tool.service';
import {CropZoneService} from '../../../image-editor/tools/crop/crop-zone.service';
import {CanvasZoomService} from '../../../image-editor/canvas/canvas-zoom.service';
import {Injectable} from '@angular/core';

interface AffectsStateModel {
    dirty: boolean;
}

const Affects_STATE_DEFAULTS: AffectsStateModel = {
    dirty: true,
};

@State<AffectsStateModel>({
    name: 'affect',
    defaults: Affects_STATE_DEFAULTS
})
@Injectable()
export class AffectsState extends BaseToolState<AffectsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.Affects;

    @Selector()
    static dirty(state: AffectsStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
        protected cropTool: CropToolService,
        protected cropZone: CropZoneService,
        protected zoom: CanvasZoomService,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<AffectsStateModel>) {
        this.store.dispatch(new CloseForePanel());
        this.cropTool.apply(this.cropZone.getSize()).then(() => {
            this.history.add(HistoryNames.CROP);
            ctx.patchState(Affects_STATE_DEFAULTS);
        });
    }

   cancelChanges(ctx: StateContext<AffectsStateModel>) {

       this.store.dispatch(new CloseForePanel());
       ctx.patchState(Affects_STATE_DEFAULTS);
   }

    resetState(ctx: StateContext<AffectsStateModel>) {
        ctx.setState(Affects_STATE_DEFAULTS);
    }
}
