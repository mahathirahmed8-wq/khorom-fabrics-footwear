/**
 * Image URL optimization helper for KHOROM
 * Dynamically adjusts image parameters (e.g. Unsplash, Cloudinary) to reduce payload size
 * while preserving visual fidelity. Does NOT modify local assets or data URLs.
 */

export function getOptimizedImageUrl(
  src: string | undefined,
  width = 450,
  quality = 75
): string {
  if (!src) return '';

  // Leave base64 data URLs, SVG, and local relative assets intact
  if (src.startsWith('data:') || src.startsWith('/') || src.endsWith('.svg')) {
    return src;
  }

  try {
    // Unsplash optimization
    if (src.includes('images.unsplash.com')) {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', String(quality));
      return url.toString();
    }

    // Cloudinary optimization
    if (src.includes('res.cloudinary.com')) {
      return src.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }

    return src;
  } catch {
    return src;
  }
}
