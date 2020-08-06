import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {AffectsToolService} from '../../../../image-editor/tools/affects/affects-tool.service';
import {Select, Store} from '@ngxs/store';
import {EditorState} from '../../../../image-editor/state/editor-state';
import {Observable} from 'rxjs';
import {DrawerName} from '../drawer-name.enum';
import {startCase} from '@common/core/utils/start-case';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';

@Component({
  selector: 'affects-drawer',
  templateUrl: './affects-drawer.component.html',
  styleUrls: ['./affects-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'controls-drawer'},
})

export class AffectsDrawerComponent {

  public filterList: string[] = [];
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
  public filters: string[] = ['grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
  'brightness', 'contrast', 'saturation', 'noise', 'vintage',
  'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
  'polaroid', 'blend-color', 'gamma', 'kodachrome',
  'blackwhite', 'blend-image', 'hue', 'resize'];

  constructor(
    private settings: Settings,
    public affectTool: AffectsToolService,
    protected store: Store,
    public config: Settings,
    private activeObject: ActiveObjectService,
    ) {
    this.filterList = this.config.get('pixie.tools.filter.items');
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

        if(e.target.checked){
            this.affectTool.apply(this.filters.indexOf(affect), affect,rangeVal,obj);
        }else
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
public applyRangeValue(e: any, affect: string) {
     var obj = this.activeObject.get();
  this.affectTool.apply(this.filters.indexOf(affect), affect,e.target.value, obj);
}
}
