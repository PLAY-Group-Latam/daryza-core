export type AcceptedFormat =
  | 'webp' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'avif' | 'bmp' | 'tiff' | 'tif' | 'ico'
  | 'svg'
  | 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv'
  | 'pdf';

export interface UploadValidationConfig {
  formats: AcceptedFormat[];
  maxSizeMB: number;
  /** Solo cuando el preset mezcla imagen + video con límites distintos */
  maxSizeMBVideo?: number;
  mediaType: 'image' | 'video';
  label: string;
}

export const UPLOAD_PRESETS = {
  // Imagen única de producto
  'product-image': {
    formats: ['webp', 'jpg', 'jpeg', 'png'],
    maxSizeMB: 1,
    mediaType: 'image',
    label: 'Imagen de producto',
  },
  // Galería de producto: imágenes + video, límites distintos
  'product-media': {
    formats: ['webp', 'jpg', 'jpeg', 'png', 'mp4', 'webm'],
    maxSizeMB: 1,        // imágenes
    maxSizeMBVideo: 15,  // videos
    mediaType: 'image',
    label: 'Media de producto',
  },
  'gallery-image': {
    formats: ['webp', 'jpg', 'jpeg', 'png', 'gif'],
    maxSizeMB: 1,
    mediaType: 'image',
    label: 'Imagen de galería',
  },
  'banner-image': {
    formats: ['webp', 'jpg', 'jpeg', 'png'],
    maxSizeMB: 1,
    mediaType: 'image',
    label: 'Banner (imagen)',
  },
  'banner-video': {
    formats: ['mp4', 'webm'],
    maxSizeMB: 15,
    mediaType: 'video',
    label: 'Banner (video)',
  },
  'avatar': {
    formats: ['webp', 'jpg', 'jpeg', 'png'],
    maxSizeMB: 1,
    mediaType: 'image',
    label: 'Avatar / Logo',
  },
  'generic-image': {
    formats: ['webp', 'jpg', 'jpeg', 'png'],
    maxSizeMB: 1,
    mediaType: 'image',
    label: 'Imagen',
  },
} as const satisfies Record<string, UploadValidationConfig>;

export type UploadPreset = keyof typeof UPLOAD_PRESETS;

const MIME_MAP: Record<AcceptedFormat, string> = {
  webp: 'image/webp',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  avif: 'image/avif',
  bmp:  'image/bmp',
  tiff: 'image/tiff',
  tif:  'image/tiff',
  ico:  'image/x-icon',
  svg:  'image/svg+xml',
  mp4:  'video/mp4',
  webm: 'video/webm',
  mov:  'video/quicktime',
  avi:  'video/x-msvideo',
  mkv:  'video/x-matroska',
  pdf:  'application/pdf',
};

export function formatsToAccept(formats: AcceptedFormat[]): string {
  return [...new Set(formats.map((f) => MIME_MAP[f]))].join(',');
}

export function resolveConfig(
  preset?: UploadPreset,
  overrides?: Partial<UploadValidationConfig>,
): UploadValidationConfig {
  const base: UploadValidationConfig = preset
    ? { ...UPLOAD_PRESETS[preset] }
    : { formats: ['webp', 'jpg', 'jpeg', 'png'], maxSizeMB: 1, mediaType: 'image', label: 'Imagen' };
  return { ...base, ...overrides };
}

export function validateFile(
  file: File,
  config: UploadValidationConfig,
): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() as AcceptedFormat | undefined;
  const allowedMimes = formatsToAccept(config.formats).split(',');
  const mimeOk = allowedMimes.includes(file.type);
  const extOk  = ext ? (config.formats as readonly string[]).includes(ext) : false;

  if (!mimeOk && !extOk) {
    const friendly = config.formats
      .filter((f) => f !== 'jpeg' && f !== 'tif')
      .map((f) => f.toUpperCase())
      .join(', ');
    return `Formato no permitido. Usa: ${friendly}.`;
  }

  const isVideoFile = file.type.startsWith('video/');
  const limit = isVideoFile && config.maxSizeMBVideo
    ? config.maxSizeMBVideo
    : config.maxSizeMB;

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > limit) {
    return `El archivo pesa ${sizeMB.toFixed(1)} MB. Máximo: ${limit} MB.`;
  }

  return null;
}