import assert from "node:assert/strict";
import { test } from "node:test";
import { ImageBitmapLoader, ImageLoader } from "three";
import SceneTextureLoader from "../src/components/scene/SceneTextureLoader.js";

function setDecoder(t, decoder) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "createImageBitmap");
  Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, writable: true, value: decoder });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "createImageBitmap", original);
    else delete globalThis.createImageBitmap;
  });
}

function browserEnvironment(t) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", { configurable: true, value: {} });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "document", original);
    else delete globalThis.document;
  });
}

test("scene maps keep their pixels and alpha while decoding asynchronously", async t => {
  browserEnvironment(t);
  const image = { width: 4096, height: 2048 };
  let loadedURL;
  t.mock.method(ImageLoader.prototype, "load", (url, onLoad) => { loadedURL = url; onLoad(image); });
  let closeCount = 0;
  const bitmap = { width: image.width, height: image.height, close() { closeCount++; } };
  setDecoder(t, async (source, options) => {
    assert.equal(source, image);
    assert.deepEqual(options, { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
    return bitmap;
  });
  const texture = await new SceneTextureLoader().loadAsync("/original-4k-sky.jpg");
  assert.equal(loadedURL, "/original-4k-sky.jpg");
  assert.equal(texture.image, bitmap);
  assert.equal(texture.version, 1);
  texture.dispose();
  assert.equal(closeCount, 1);
});

test("unsupported or rejected bitmap decoding retains the normal image loader", async t => {
  browserEnvironment(t);
  const image = { width: 1024, height: 512 };
  t.mock.method(ImageLoader.prototype, "load", (_, onLoad) => onLoad(image));
  setDecoder(t, undefined);
  for (const decoder of [undefined, () => Promise.reject(new Error("Decoder unavailable"))]) {
    Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, writable: true, value: decoder });
    const texture = await new SceneTextureLoader().loadAsync("/cloud-alpha.webp");
    assert.equal(texture.image, image);
    assert.equal(texture.flipY, true);
    assert.equal(texture.premultiplyAlpha, false);
  }
});

test("worker maps decode without a DOM and release their original-size bitmap", async t => {
  setDecoder(t, () => {});
  let closed = false;
  const bitmap = { width: 4096, height: 2048, close() { closed = true; } };
  // The worker loader does not allocate HTML images or copy pixels back to the UI thread.
  t.mock.method(ImageLoader.prototype, "load", () => assert.fail("Worker must not use HTML images"));
  t.mock.method(ImageBitmapLoader.prototype, "load", function (url, onLoad) {
    assert.equal(url, "sky.jpg");
    assert.equal(this.path, "/assets/");
    assert.deepEqual(this.options, { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
    onLoad(bitmap);
  });
  const texture = await new SceneTextureLoader().setPath("/assets/").loadAsync("sky.jpg");
  assert.equal(texture.image, bitmap);
  assert.equal(texture.version, 1);
  assert.equal(closed, false);
  texture.dispose();
  assert.equal(closed, true);
});

test("worker texture failures reject so the scene can activate its fallback", async t => {
  setDecoder(t, () => {});
  const failure = new Error("Image decoding failed");
  t.mock.method(ImageBitmapLoader.prototype, "load", (_, _load, _progress, onError) => onError(failure));
  await assert.rejects(new SceneTextureLoader().loadAsync("/missing.webp"), error => error === failure);
});
