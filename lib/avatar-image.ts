import { AVATAR_SIZE } from '@/lib/avatar';

export interface ProcessedAvatar {
  blob: Blob;
  extension: 'webp' | 'jpg' | 'png';
}

/**
 * Crops a picked photo to a centred square, scales it to AVATAR_SIZE and re-encodes it.
 * Re-drawing on a canvas drops all metadata, including the GPS location phones store in EXIF.
 * Browser only.
 */
export async function processAvatarImage(file: Blob): Promise<ProcessedAvatar> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Bu resim tarayıcınızda açılamadı. Lütfen JPG veya PNG bir fotoğraf deneyin.');
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = Math.round((bitmap.width - side) / 2);
  const sy = Math.round((bitmap.height - side) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Resim işlenemedi.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();

  const encode = (type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await encode('image/webp', 0.86);
  if (webp && webp.type === 'image/webp') return { blob: webp, extension: 'webp' };
  const jpeg = await encode('image/jpeg', 0.88);
  if (jpeg) return { blob: jpeg, extension: 'jpg' };
  throw new Error('Resim işlenemedi.');
}
