import { useContext, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import ReflectionTextureLoader from "./ReflectionTextureLoader";
import { SceneQualityContext } from "./SceneQualityContext";

// Local softbox reflections give metal and glass a surface to reflect.
// The environment lights the exhibits; the astronomical sky remains visible.
export default function SceneReflections() {
  const { get } = useThree();
  const { textures } = useContext(SceneQualityContext);
  const texture = useLoader(ReflectionTextureLoader, textures.reflections);
  useEffect(() => {
    const scene = get().scene;
    const previous = scene.environment;
    const intensity = scene.environmentIntensity;
    scene.environment = texture;
    scene.environmentIntensity = 0.4;
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = intensity;
    };
  }, [get, texture]);
  return null;
}
