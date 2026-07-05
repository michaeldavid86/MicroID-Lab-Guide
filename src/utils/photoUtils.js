// photoUtils.js — image compression for lab photo uploads
// Resizes to fit within maxWidth×maxWidth and compresses to JPEG.
// Targets a small footprint so many photos fit comfortably in IndexedDB.

function drawToDataUrl(source, w, h, maxWidth, quality) {
  // Bound BOTH dimensions so tall/portrait images are also constrained
  const ratio = Math.min(1, maxWidth / w, maxWidth / h);
  const cw = Math.max(1, Math.round(w * ratio));
  const ch = Math.max(1, Math.round(h * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, cw, ch);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function compressImage(file, maxWidth = 1200, quality = 0.75) {
  // Preferred path: createImageBitmap decodes more formats than <img> and is
  // resilient to some HEIC/odd files, decoding off the main thread.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const url = drawToDataUrl(bitmap, bitmap.width, bitmap.height, maxWidth, quality);
      if (bitmap.close) bitmap.close();
      return url;
    } catch {
      // fall through to the <img> path
    }
  }

  // Fallback: decode via an <img> element
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        resolve(drawToDataUrl(img, img.width, img.height, maxWidth, quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This image could not be read — it may be an unsupported format (e.g. HEIC) or corrupt. Try a JPG/PNG or take a new photo."));
    };
    img.src = objectUrl;
  });
}

export function formatPhotoSize(dataUrl) {
  if (!dataUrl) return "";
  // base64 string length → approximate byte size
  const bytes = Math.round((dataUrl.length * 3) / 4);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
