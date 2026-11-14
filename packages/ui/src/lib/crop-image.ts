export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Pan = {
  x: number;
  y: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("image_load_failed")));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/** Maps pan/zoom in a square viewport to source-image pixel coordinates. */
export function computePixelCrop(
  imageWidth: number,
  imageHeight: number,
  pan: Pan,
  zoom: number,
  viewportSize: number,
): PixelCrop {
  const baseScale = Math.max(
    viewportSize / imageWidth,
    viewportSize / imageHeight,
  );
  const scale = baseScale * zoom;
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;
  const imageLeft = (viewportSize - scaledWidth) / 2 + pan.x;
  const imageTop = (viewportSize - scaledHeight) / 2 + pan.y;
  const srcX = (0 - imageLeft) / scale;
  const srcY = (0 - imageTop) / scale;
  const srcSize = viewportSize / scale;
  const x = Math.max(0, Math.min(srcX, imageWidth - srcSize));
  const y = Math.max(0, Math.min(srcY, imageHeight - srcSize));
  const size = Math.min(srcSize, imageWidth - x, imageHeight - y);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(size),
    height: Math.round(size),
  };
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  mimeType: string = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas_unavailable");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("blob_unavailable"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
