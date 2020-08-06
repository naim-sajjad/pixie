import {InjectionToken} from '@angular/core';
import {Frame} from './tools/frame/frame';
import {BasicShape, defaultShapes} from './tools/shapes/default-shapes';
import {defaultStickers, StickerCategory} from './tools/shapes/default-stickers';
import {BrushSizes, BrushTypes} from './tools/draw/draw-defaults';
import {FontItem} from '../image-editor-ui/toolbar-controls/widgets/google-fonts-panel/font-item';
import {EditorMode} from './enums/editor-mode.enum';
import {EditorTheme} from './enums/editor-theme.enum';
import {NavPosition} from './enums/control-positions.enum';
import {DrawerName} from '../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';
import {defaultObjectProps} from './objects/default-object-props';
import {SampleImage} from '../image-editor-ui/panels/open-sample-image-panel/sample-image';

export const MERGED_CONFIG = new InjectionToken<PixieConfig>('MERGED_CONFIG');

export const PIXIE_VERSION = '2.2.1';

export interface NavItem {
    name?: string;
    display_name?: string;
    action?: string|Function|'merge';
    icon?: string;
    type?: 'separator'|'button';
}

export interface ObjectDefaults {
    transparentCorners?: boolean;
    borderOpacityWhenMoving?: number;
    cornerStyle?: 'circle'|'rect';
    cornerColor?: string;
    cornerStrokeColor?: string;
    cornerSize?: number;
    stroke?: string;
    strokeWidth?: number;
    lockUniScaling?: boolean;
    fill?: string;
    textAlign?: string;
    underline?: false;
    linethrough?: false;
    fontStyle?: 'normal';
    fontFamily?: 'Times New Roman';
    fontWeight?: 400;
}

export interface PixieConfig {
    selector?: string;
    image?: string|HTMLImageElement;
    crossOrigin?: boolean;
    blankCanvasSize?: {width: number; height: number};
    watermarkText?: string;
    textureSize?: number;
    baseUrl?: string;
    ui?: {
        visible: boolean;
        defaultTheme: string,
        mode: EditorMode,
        allowEditorClose?: boolean,
        width?: string,
        height?: string,
        compact?: boolean,
        ignoreMobileKeyboard?: boolean;
        showExportPanel?: boolean,
        colorPresets?: {
            items: string[],
            replaceDefault: boolean,
        },
        nav: {
            position: NavPosition,
            replaceDefault?: boolean,
            items: NavItem[],
        },
        openImageDialog?: {
            show: boolean,
            sampleImages?: SampleImage[],
        },
        toolbar?: {
            hide?: boolean,
            hideOpenButton?: boolean,
            hideCloseButton?: boolean,
            hideSaveButton?: boolean,
            hideHistoryButtons?: boolean,
            hideObjectsButton?: boolean,
            openButtonAction?: Function,
        },
    };
    languages?: {
        custom?: {[key: string]: {[key: string]: string}},
        active: string,
    };
    saveUrl?: string;
    onSave?: Function;
    onLoad?: Function;
    onClose?: Function;
    onOpen?: Function;
    onFileOpen?: Function;
    onMainImageLoaded?: Function;
    googleFontsApiKey?: string;
    tools?: {
        filter?: {
            replaceDefault?: boolean,
            items: string[],
        },
        resize?: {
            minWidth?: number;
            maxWidth?: number;
            minHeight?: number;
            maxHeight?: number;
        }
        crop?: {
            replaceDefaultPresets?: boolean,
            hideCustomControls?: boolean,
            defaultRatio?: string,
            cropZone?: {
                selectable: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                hasControls: false,
                hasBorders: false,
            },
            presets: {ratio: string, name: string}[],
        },
        draw: {
            replaceDefaultBrushSizes?: boolean,
            replaceDefaultBrushTypes?: boolean,
            brushSizes: number[],
            brushTypes: string[],
        }
        text?: {
            defaultText?: string,
            replaceDefault?: boolean,
            defaultCategory?: string,
            items?: FontItem[],
        }
        frame?: {
            replaceDefault?: boolean,
            items?: Frame[],
        },
        shapes?: {
            replaceDefault?: boolean,
            items?: BasicShape[],
        },
        stickers?: {
            replaceDefault?: boolean,
            items?: StickerCategory[],
        },
        import?: {
            validExtensions?: string[],
            maxFileSize?: number; // in bytes
            fitOverlayToScreen?: boolean;
            openDroppedImageAsBackground?: boolean;
        },
        export?: {
            defaultFormat: 'png'|'jpeg'|'json',
            defaultQuality: number,
            defaultName: string,
        },
        zoom?: {
            allowUserZoom?: boolean;
            fitImageToScreen?: boolean;
        }
    };
    objectDefaults?: {
        global?: ObjectDefaults;
        basicShape?: ObjectDefaults;
        sticker?: ObjectDefaults;
        text?: ObjectDefaults;
    };
}

export const DEFAULT_CONFIG: PixieConfig  = {
    selector: 'pixie-editor',
    textureSize: 4096,
    ui: {
        visible: true,
        mode: EditorMode.INLINE,
        defaultTheme: EditorTheme.LIGHT,
        ignoreMobileKeyboard: true,
        allowEditorClose: true,
        toolbar: {
            hideOpenButton: false,
            hideCloseButton: false,
        },
        nav: {
            position: NavPosition.TOP,
            replaceDefault: false,
            items: [
                {name: 'Filter', icon: 'filter-custom', action: DrawerName.FILTER},
                {name: 'Affects', icon: 'filter-custom', action: DrawerName.Affects},
                {type: 'separator'},
                {name: 'resize', icon: 'resize-custom', action: DrawerName.RESIZE},
                {name: 'crop', icon: 'crop-custom', action: DrawerName.CROP},
                {name: 'transform', icon: 'transform-custom', action: DrawerName.TRANSFORM},
                {type: 'separator'},
                {name: 'draw', icon: 'pencil-custom', action: DrawerName.DRAW},
                {name: 'text', icon: 'text-box-custom', action: DrawerName.TEXT},
                {name: 'shapes', icon: 'polygon-custom', action: DrawerName.SHAPES},
                {name: 'stickers', icon: 'sticker-custom', action: DrawerName.STICKERS},
                {name: 'frame', icon: 'frame-custom', action: DrawerName.FRAME},
                {type: 'separator'},
                {name: 'corners', icon: 'rounded-corner-custom', action: DrawerName.CORNERS},
                {name: 'background', icon: 'background-custom', action: DrawerName.BACKGROUND},
                {name: 'merge', icon: 'merge-custom', action: DrawerName.MERGE},
            ]
        },
        openImageDialog: {
            show: true,
            sampleImages: [
                {
                    url: 'images/samples/sample1.jpg',
                    thumbnail: 'images/samples/sample1_thumbnail.jpg',
                },
                {
                    url: 'images/samples/sample2.jpg',
                    thumbnail: 'images/samples/sample2_thumbnail.jpg',
                },
                {
                    url: 'images/samples/sample3.jpg',
                    thumbnail: 'images/samples/sample3_thumbnail.jpg',
                },
            ]
        },
        colorPresets: {
            replaceDefault: false,
            items: [
                'rgb(0,0,0)',
                'rgb(255, 255, 255)',
                'rgb(242, 38, 19)',
                'rgb(249, 105, 14)',
                'rgb(253, 227, 167)',
                'rgb(4, 147, 114)',
                'rgb(30, 139, 195)',
                'rgb(142, 68, 173)',
            ],
        }
    },
    languages: {
        active: 'default',
    },
    googleFontsApiKey: 'AIzaSyDOrI6VJiMbR6XLvlp3CdCPZj1T2PzVkKs',
    objectDefaults: {
        global: {
            transparentCorners: false,
            borderOpacityWhenMoving: 1,
            cornerStyle: 'circle',
            cornerColor: '#ccc',
            cornerStrokeColor: '#fff',
            cornerSize: 16,
            strokeWidth: 0.05,
            lockUniScaling: true,
            ...defaultObjectProps,
        },
        text: {
            textAlign: 'initial',
            underline: false,
            linethrough: false,
            fontStyle: 'normal',
            fontFamily: 'Times New Roman',
            fontWeight: 400,
        }
    },
    tools: {
        filter: {
            replaceDefault: false,
            items: [
                'grayscale',
                'blackWhite',
                'sharpen',
                'invert',
                'vintage',
                'polaroid',
                'kodachrome',
                'technicolor',
                'brownie',
                'sepia',
                'removeColor',
                'brightness',
                'gamma',
                'noise',
                'pixelate',
                'blur',
                'emboss',
                'blendColor',
            ]
        },
        zoom: {
            allowUserZoom: true,
            fitImageToScreen: true,
        },
        crop: {
            replaceDefaultPresets: false,
            hideCustomControls: false,
            defaultRatio: '16:9',
            presets: [
                {ratio: '3:2', name: '3:2'},
                {ratio: '5:3', name: '5:3'},
                {ratio: '4:3', name: '4:3'},
                {ratio: '5:4', name: '5:4'},
                {ratio: '6:4', name: '6:4'},
                {ratio: '7:5', name: '7:5'},
                {ratio: '10:8', name: '10:8'},
                {ratio: '16:9', name: '16:9'},
            ]
        },
        text: {
            defaultCategory: 'handwriting',
            defaultText: 'Double click to edit',
        },
        draw: {
            brushSizes: BrushSizes,
            brushTypes: BrushTypes,
        },
        shapes: {
            replaceDefault: false,
            items: defaultShapes.slice(),
        },
        stickers: {
            replaceDefault: false,
            items: defaultStickers,
        },
        import: {
            validExtensions: ['png', 'jpg', 'jpeg', 'svg', 'json', 'gif'],
            fitOverlayToScreen: true,
            openDroppedImageAsBackground: false,
        },
        export: {
            defaultFormat: 'png',
            defaultQuality: 0.8,
            defaultName: 'image',
        },
        frame: {
            replaceDefault: false,
            items: [
                {
                    name: 'basic',
                    mode: 'basic',
                    size: {
                        min: 1,
                        max: 35,
                        default: 10,
                    }
                },
                {
                    name: 'pine',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'oak',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'rainbow',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'grunge1',
                    display_name: 'grunge #1',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'grunge2',
                    display_name: 'grunge #2',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 20,
                    }
                },
                {
                    name: 'ebony',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'art1',
                    display_name: 'Art #1',
                    mode: 'repeat',
                    size: {
                        min: 10,
                        max: 70,
                        default: 55,
                    },
                },
                {
                    name: 'art2',
                    display_name: 'Art #2',
                    mode: 'repeat',
                    size: {
                        min: 10,
                        max: 70,
                        default: 55,
                    },
                }
            ]
        }
    }
};
