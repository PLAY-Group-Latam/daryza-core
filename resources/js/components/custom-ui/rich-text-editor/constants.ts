export const MAX_INLINE_IMAGE_MB = 5;
export const MAX_INLINE_IMAGE_BYTES = MAX_INLINE_IMAGE_MB * 1024 * 1024;

export const GCS_HOST = 'storage.googleapis.com';

export const DEFAULT_TEXT_COLOR = '#000000';
export const DEFAULT_HIGHLIGHT_COLOR = '#ffff00';

export const HEADING_LEVELS = [1, 2, 3, 4] as const;

export const COLOR_PALETTE: readonly string[][] = [
    [
        '#000000',
        '#434343',
        '#666666',
        '#999999',
        '#b7b7b7',
        '#cccccc',
        '#d9d9d9',
        '#efefef',
        '#f3f3f3',
        '#ffffff',
    ],
    [
        '#ff0000',
        '#ff4e00',
        '#ff9900',
        '#fad900',
        '#99cc00',
        '#33cc99',
        '#3399ff',
        '#0033cc',
        '#762ca7',
        '#ff0099',
    ],
    [
        '#ffcccc',
        '#ffe6cc',
        '#ffffcc',
        '#e6f2ff',
        '#e6f7ff',
        '#e6e6ff',
        '#f2e6ff',
        '#ffe6f2',
        '#f9f9f9',
        '#f0f0f0',
    ],
    [
        '#ea9999',
        '#f9cb9c',
        '#ffe599',
        '#b6d7a8',
        '#a2c4c9',
        '#9fc5e8',
        '#b4a7d6',
        '#d5a6bd',
        '#e2e2e2',
        '#dcdcdc',
    ],
    [
        '#e06666',
        '#f6b26b',
        '#ffd966',
        '#93c47d',
        '#76a5af',
        '#6fa8dc',
        '#8e7cc3',
        '#c27ba0',
        '#c8c8c8',
        '#b4b4b4',
    ],
    [
        '#cc0000',
        '#e69138',
        '#f1c232',
        '#6aa84f',
        '#45818e',
        '#3d85c6',
        '#674ea7',
        '#a64d79',
        '#969696',
        '#828282',
    ],
    [
        '#990000',
        '#b45f06',
        '#bf9000',
        '#38761d',
        '#134f5c',
        '#0b5394',
        '#351c75',
        '#741b47',
        '#595959',
        '#464646',
    ],
    [
        '#660000',
        '#783f04',
        '#7f6000',
        '#274e13',
        '#0c343d',
        '#073763',
        '#20124d',
        '#4c1130',
        '#222222',
        '#111111',
    ],
];

export const LIGHT_COLORS = new Set<string>([
    '#ffffff',
    '#f3f3f3',
    '#efefef',
    '#d9d9d9',
    '#cccccc',
    '#fad900',
    '#ffff00',
    '#ffffcc',
]);
