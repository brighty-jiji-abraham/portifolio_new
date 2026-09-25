/* eslint-disable react/no-unknown-property */
import { Component, Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { DoubleSide } from "three";

function SolarSatellite() {
  return (
    <group rotation={[0.35, -0.3, -0.4]} scale={0.58}>
      <mesh>
        <boxGeometry args={[0.36, 0.42, 0.32]} />
        <meshStandardMaterial
          color="#e5b578"
          metalness={0.35}
          roughness={0.5}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.6, 8]} />
        <meshStandardMaterial
          color="#cbd4db"
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.63, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.68, 0.62, 0.045]} />
            <meshStandardMaterial
              color="#78a6bf"
              metalness={0.45}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 0, 0.028]}>
            <boxGeometry args={[0.62, 0.56, 0.012]} />
            <meshStandardMaterial
              color="#245386"
              metalness={0.35}
              roughness={0.35}
            />
          </mesh>
          {[-0.2, 0, 0.2].map((x) => (
            <mesh key={x} position={[x, 0, 0.037]}>
              <boxGeometry args={[0.008, 0.56, 0.008]} />
              <meshBasicMaterial color="#a8d4e5" />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.038]}>
            <boxGeometry args={[0.62, 0.008, 0.008]} />
            <meshBasicMaterial color="#a8d4e5" />
          </mesh>
        </group>
      ))}
      <group position={[0, 0.28, 0]} rotation={[0.3, 0, 0.25]}>
        <mesh>
          <coneGeometry args={[0.23, 0.14, 16, 1, true]} />
          <meshStandardMaterial
            color="#e3ece8"
            side={DoubleSide}
            roughness={0.45}
          />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.23, 6]} />
          <meshStandardMaterial color="#e5b578" />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#9cfff0" />
        </mesh>
      </group>
    </group>
  );
}

function RingedPlanet() {
  return (
    <group rotation={[0.55, 0.1, -0.4]}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 24]} />
        <meshStandardMaterial color="#c99a77" roughness={0.9} />
      </mesh>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.39, 0.58, 64]} />
          <meshStandardMaterial
            color="#e0c5a4"
            side={DoubleSide}
            roughness={0.9}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[0.61, 0.64, 64]} />
          <meshStandardMaterial
            color="#94c8c5"
            side={DoubleSide}
            roughness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

function Spacecraft() {
  const asset = useGLTF(
    `${import.meta.env.BASE_URL}models/kenney/craft-speeder.glb`,
  );
  const model = useMemo(() => {
    const copy = asset.scene.clone(true);
    // This asset's authored origin is offset from its geometry center.
    copy.position.set(-2, -0.4, -1.5);
    copy.traverse((child) => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      child.material.metalness = 0.25;
      child.material.roughness = 0.5;
      if (child.material.name === "metalRed")
        child.material.color.set("#dca270");
    });
    return copy;
  }, [asset.scene]);

  useEffect(
    () => () => {
      model.traverse((child) => {
        if (child.isMesh) child.material.dispose();
      });
    },
    [model],
  );

  return (
    <group scale={0.32} rotation={[0.75, 0.35, -0.35]}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

class ModelBoundary extends Component {
  state = { unavailable: false };
  static getDerivedStateFromError() {
    return { unavailable: true };
  }
  render() {
    return this.state.unavailable ? null : this.props.children;
  }
}

export default function SpaceObjects({ timeRef }) {
  const satellite = useRef();
  const planet = useRef();
  const craft = useRef();
  const compact = useThree((state) => state.size.width < 760);

  useFrame(() => {
    // The common scene clock also stops these objects when motion is paused.
    const t = timeRef.current;
    if (satellite.current) {
      const angle = 2.5 + t * 0.035;
      satellite.current.position.set(
        Math.cos(angle) * (compact ? 2.8 : 3.55),
        Math.sin(angle) * 2.9,
        0.4,
      );
      satellite.current.rotation.y = Math.sin(t * 0.15) * 0.3;
      satellite.current.rotation.z = Math.sin(t * 0.2) * 0.12;
    }
    if (planet.current) {
      planet.current.position.set(
        compact ? 2.35 : 2.75,
        2.45 + Math.sin(t * 0.2) * 0.1,
        -0.7,
      );
      planet.current.rotation.y = t * 0.04;
    }
    if (craft.current) {
      const angle = -0.7 - t * 0.045;
      craft.current.position.set(
        Math.cos(angle) * 3.5,
        Math.sin(angle) * 3.2,
        0.6,
      );
      craft.current.rotation.z = -t * 0.045;
    }
  });

  return (
    <>
      <group ref={satellite} name="solar-satellite">
        <SolarSatellite />
      </group>
      <group ref={planet} name="ringed-planet">
        <RingedPlanet />
      </group>
      <group ref={craft} name="explorer-spacecraft">
        <ModelBoundary>
          <Suspense fallback={null}>
            <Spacecraft />
          </Suspense>
        </ModelBoundary>
      </group>
    </>
  );
}
