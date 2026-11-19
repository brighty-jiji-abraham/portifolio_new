/* eslint-disable react/no-unknown-property */
import { useContext, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SceneQualityContext } from "./SceneQualityContext";

import { blackHoleShader } from "./blackHoleShader";

export default function BlackHole({ timeRef, cinemaActive = false }) {
  const { textures } = useContext(SceneQualityContext);
  const mesh = useRef();
  const material = useRef();
  const { size } = useThree();
  const compact = size.width < 1000;
  const sky = useTexture(textures.sky);
  const skyInverse = useMemo(() => new THREE.Matrix3().setFromMatrix4(
    new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.25, -1.1, 0.52)),
  ).invert(), []);
  const cameraRotation = useMemo(() => new THREE.Matrix3(), []);
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    cinematic: { value: 0 },
    zoom: { value: 1 },
    bank: { value: 0 },
    inclination: { value: 3.8 },
    aspect: { value: 26 / 14.6 },
    sky: { value: sky },
    cameraToSky: { value: new THREE.Matrix3() },
    exposure: { value: 1 },
  }), [sky]);
  const skyLayout = useMemo(() => {
    if (!compact) return { direction: new THREE.Vector3(97, 87, -360), width: 206 };
    const unitsPerPixel = 2 * Math.tan(55 * Math.PI / 360) * 360 / size.height;
    return {
      direction: new THREE.Vector3(
        (size.width / 2 - 60) * unitsPerPixel,
        (size.height / 2 - (size.height < 600 ? 145 : 195)) * unitsPerPixel,
        -360,
      ),
      width: 108 * unitsPerPixel,
    };
  }, [compact, size.width, size.height]);
  useFrame(({ camera }) => {
    const values = material.current.uniforms;
    // Like the star field, a distant black hole has negligible travel parallax.
    // Camera rotation reveals it naturally; it never grows across a panel.
    if (!cinemaActive) {
      mesh.current.position.copy(camera.position).add(skyLayout.direction);
      mesh.current.scale.set(skyLayout.width, skyLayout.width * 0.562, 1);
      values.cinematic.value = 0;
      values.bank.value = 0;
      values.inclination.value = 3.8;
      values.exposure.value = 1;
    }
    mesh.current.quaternion.copy(camera.quaternion);
    material.current.uniforms.time.value = timeRef.current;
    camera.updateMatrixWorld();
    values.cameraToSky.value.copy(skyInverse).multiply(cameraRotation.setFromMatrix4(camera.matrixWorld));
  });
  return (
    <mesh
      ref={mesh}
      name="black-hole"
      scale={[skyLayout.width, skyLayout.width * 0.562, 1]}
      raycast={() => null}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; varying vec3 vViewPosition;
          void main() { vUv = uv;
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = viewPosition.xyz;
            gl_Position = projectionMatrix * viewPosition; }`}
        fragmentShader={blackHoleShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
