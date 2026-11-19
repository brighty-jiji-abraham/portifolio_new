import { ImageBitmapLoader, ImageLoader, Loader, Texture } from "three";

// Decode and orient photographic maps asynchronously before GPU upload. The
// original pixels, alpha and dimensions are retained at every quality level.
export default class SceneTextureLoader extends Loader {
  load(url, onLoad, onProgress, onError) {
    const texture = new Texture();
    const finish = image => {
      texture.image = image;
      texture.needsUpdate = true;
      onLoad(texture);
    };
    if (typeof document === "undefined" || typeof WorkerGlobalScope !== "undefined") {
      new ImageBitmapLoader(this.manager).setPath(this.path).setOptions({
        imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none",
      }).load(url, bitmap => {
        texture.addEventListener("dispose", () => bitmap.close());
        finish(bitmap);
      }, onProgress, onError);
      return texture;
    }
    // Keep image request prioritization and the browser's image cache. Decode
    // into a bitmap after loading; unsupported decoders use the same image.
    new ImageLoader(this.manager)
      .setPath(this.path).setCrossOrigin(this.crossOrigin)
      .load(url, image => {
        if (typeof createImageBitmap !== "function") { finish(image); return; }
        createImageBitmap(image, {
          imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none",
        }).then(bitmap => {
          texture.addEventListener("dispose", () => bitmap.close());
          finish(bitmap);
        }, () => finish(image));
      }, onProgress, onError);
    return texture;
  }
}
