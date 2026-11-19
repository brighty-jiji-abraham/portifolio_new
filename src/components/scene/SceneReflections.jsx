import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Local softbox reflections give metal and glass a surface to reflect.
// The environment lights the exhibits; the astronomical sky remains visible.
export default function SceneReflections() {
  const { gl, get } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    const scene = get().scene;
    const previous = scene.environment;
    const intensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.4;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = intensity;
      target.dispose();
    };
  }, [gl, get]);
  return null;
}
