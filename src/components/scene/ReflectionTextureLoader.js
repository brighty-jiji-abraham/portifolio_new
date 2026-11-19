import { createSceneCanvas } from "./scenePlatform";
import {
  CubeUVReflectionMapping, DataTexture, HalfFloatType, ImageLoader, ImageBitmapLoader,
  LinearFilter, LinearSRGBColorSpace, Loader, RGBAFormat,
} from "three";

// The baked PMREM stores each RGB half-float as two bytes in an opaque PNG.
// Decode the original HDR values; do not apply an image color grade or resize.
export default class ReflectionTextureLoader extends Loader {
  load(url, onLoad, onProgress, onError) {
    const loader = typeof document === "undefined" || typeof WorkerGlobalScope !== "undefined"
      ? new ImageBitmapLoader(this.manager).setOptions({ imageOrientation: "none", premultiplyAlpha: "none", colorSpaceConversion: "none" })
      : new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);
    return loader.load(url, (image) => {
      try {
        const canvas = createSceneCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const bytes = context.getImageData(0, 0, image.width, image.height).data;
        const pixels = new Uint16Array(image.width * image.height * 2);
        for (let i = 0; i < pixels.length / 4; i++) {
          const offset = i * 8;
          pixels[i * 4] = bytes[offset] | (bytes[offset + 1] << 8);
          pixels[i * 4 + 1] = bytes[offset + 2] | (bytes[offset + 4] << 8);
          pixels[i * 4 + 2] = bytes[offset + 5] | (bytes[offset + 6] << 8);
          pixels[i * 4 + 3] = 0x3c00; // 1.0 in half-float; environment sampling uses RGB.
        }
        const texture = new DataTexture(pixels, image.width / 2, image.height, RGBAFormat, HalfFloatType);
        texture.mapping = CubeUVReflectionMapping;
        texture.colorSpace = LinearSRGBColorSpace;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.needsUpdate = true;
        image.close?.();
        onLoad(texture);
      } catch (error) {
        onError?.(error);
      }
    }, onProgress, onError);
  }
}
