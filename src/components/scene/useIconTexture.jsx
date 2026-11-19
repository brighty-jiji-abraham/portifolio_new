import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";

export default function useIconTexture(Icon, color) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const svg = renderToStaticMarkup(<Icon />)
      .replace(/currentColor/g, color)
      .replace(/width="1em"/, 'width="128"')
      .replace(/height="1em"/, 'height="128"');
    // A data URL stays valid if a category changes before its image finishes loading.
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    let disposed = false;
    const loaded = new THREE.TextureLoader().load(url, (map) => {
      if (disposed) {
        map.dispose();
        return;
      }
      map.colorSpace = THREE.SRGBColorSpace;
      setTexture(map);
    });
    return () => {
      disposed = true;
      loaded.dispose();
    };
  }, [Icon, color]);
  return texture;
}
