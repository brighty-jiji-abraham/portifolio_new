import { useEffect, useLayoutEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import SceneTextureLoader from "./SceneTextureLoader";

export default function useSceneTexture(urls, configure) {
  const gl = useThree(state => state.gl);
  const textures = useLoader(SceneTextureLoader, urls);
  useLayoutEffect(() => { configure?.(textures); }, [configure, textures]);
  useEffect(() => {
    for (const texture of Array.isArray(textures) ? textures : [textures]) gl.initTexture(texture);
  }, [gl, textures]);
  return textures;
}
