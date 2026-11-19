/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DOCUMENTS } from "./mission";

function documentTexture(document) {
  const canvas = window.document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#101e2a";
  ctx.fillRect(0, 0, 256, 320);
  ctx.strokeStyle = "#44616d";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 248, 312);
  ctx.fillStyle = "#a4dbe5";
  ctx.fillRect(24, 26, 26, 32);
  ctx.fillStyle = "#e2edf0";
  ctx.font = "600 18px Segoe UI, sans-serif";
  ctx.fillText(document.title.split(" ")[0], 24, 94);
  ctx.fillStyle = "#88b7c8";
  ctx.font = "14px Segoe UI, sans-serif";
  ctx.fillText(document.tag, 24, 120);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i === 2 || i === 3 ? "#7baebc" : "#354e5e";
    ctx.fillRect(24, 150 + i * 15, 130 + ((i * 17) % 67), 4);
  }
  ctx.fillStyle = "#98c4cf";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillText("Inspect source", 24, 298);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function DocumentNode({
  document,
  index,
  motion: motionRef,
  relevant,
  selected,
  onSelect,
  interactive,
}) {
  const group = useRef();
  const material = useRef();
  const texture = useMemo(() => documentTexture(document), [document]);
  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);
  useFrame(() => {
    if (!group.current) return;
    const { time, retrieval } = motionRef.current;
    const pull =
      relevant && retrieval >= 0
        ? Math.sin(Math.min(1, retrieval) * Math.PI) * 0.18
        : 0;
    group.current.position.set(
      document.position[0] * (1 - pull),
      document.position[1] + Math.sin(time * 0.6 + index * 2) * 0.06,
      document.position[2],
    );
    group.current.rotation.y = Math.sin(time * 0.3 + index) * 0.12;
    const lit = selected || (relevant && retrieval >= 0);
    material.current.emissiveIntensity = lit ? 1.1 : 0.15;
    const scale = selected ? 1.16 : 1;
    group.current.scale.setScalar(scale);
  });
  return (
    <group
      ref={group}
      position={document.position}
      name={`source-${document.id}`}
    >
      <mesh
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                onSelect(document.id);
              }
            : undefined
        }
      >
        <boxGeometry args={[0.76, 0.98, 0.055]} />
        <meshStandardMaterial
          ref={material}
          color="#233d4c"
          emissive="#73d4e2"
          emissiveIntensity={0.15}
          metalness={0.55}
          roughness={0.32}
        />
      </mesh>
      <mesh
        position={[0, 0, 0.032]}
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                onSelect(document.id);
              }
            : undefined
        }
      >
        <planeGeometry args={[0.7, 0.91]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function RetrievalExhibit({
  motion: motionRef,
  query,
  source,
  onSelect,
  interactive,
}) {
  const invalidate = useThree((state) => state.invalidate);
  const assembly = useRef();
  const core = useRef();
  const inner = useRef();
  const halo = useRef();
  const packets = useRef();
  const drag = useRef(null);
  const curves = useMemo(
    () =>
      DOCUMENTS.map((document) => {
        const start = new THREE.Vector3(...document.position);
        return new THREE.QuadraticBezierCurve3(
          start,
          start
            .clone()
            .multiplyScalar(0.6)
            .add(new THREE.Vector3(0, 0.45, 0.65)),
          new THREE.Vector3(),
        );
      }),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const { time, retrieval, rotation } = motionRef.current;
    if (assembly.current) assembly.current.rotation.y = rotation;
    if (inner.current) {
      inner.current.rotation.y = time * 0.3;
      inner.current.rotation.z = time * 0.11;
    }
    if (halo.current) halo.current.rotation.z = time * 0.15;
    if (core.current)
      core.current.emissiveIntensity =
        retrieval < 0 ? 0.4 : 0.7 + Math.sin(retrieval * Math.PI) * 1.1;
    if (!packets.current) return;
    DOCUMENTS.forEach((document, index) => {
      const selected = query.sources.includes(document.id);
      for (let j = 0; j < 3; j++) {
        const visible = selected && retrieval > 0 && retrieval < 1;
        const t = (retrieval * 2.3 + j / 3) % 1;
        curves[index].getPoint(t, point);
        dummy.position.copy(point);
        dummy.scale.setScalar(
          visible ? 0.045 + Math.sin(t * Math.PI) * 0.025 : 0,
        );
        dummy.updateMatrix();
        packets.current.setMatrixAt(index * 3 + j, dummy.matrix);
      }
    });
    packets.current.instanceMatrix.needsUpdate = true;
  });
  const onPointerDown = (event) => {
    if (!interactive) return;
    event.stopPropagation();
    drag.current = event.clientX;
    event.target.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (drag.current === null) return;
    motionRef.current.rotation += (event.clientX - drag.current) * 0.009;
    drag.current = event.clientX;
    invalidate();
  };
  const release = (event) => {
    drag.current = null;
    if (event.target.hasPointerCapture?.(event.pointerId))
      event.target.releasePointerCapture(event.pointerId);
  };
  return (
    <group position={[-1.05, 0.1, -12.8]} name="hybrid-rag-exhibit">
      <mesh position={[0, -2.25, 0]}>
        <cylinderGeometry args={[1.6, 1.85, 0.5, 48]} />
        <meshStandardMaterial color="#263d4b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.4, 64]} />
        <meshBasicMaterial
          color={[0.3, 1.3, 1.7]}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.58, 1.35, 1.8, 40, 1, true]} />
        <meshBasicMaterial
          color="#68c5df"
          transparent
          opacity={0.035}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group ref={assembly}>
        <group
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <mesh>
            <icosahedronGeometry args={[0.62, 1]} />
            <meshPhysicalMaterial
              ref={core}
              color="#214b65"
              emissive="#348fac"
              emissiveIntensity={0.4}
              roughness={0.16}
              metalness={0.6}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={inner}>
            <octahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial
              color="#e0af73"
              emissive="#c07832"
              emissiveIntensity={0.5}
              metalness={0.7}
              roughness={0.24}
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.64, 1]} />
            <meshBasicMaterial
              color="#a5e9ec"
              wireframe
              transparent
              opacity={0.45}
            />
          </mesh>
          <group ref={halo}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[i * 1.05, i * 0.7, 0.4]}>
                <torusGeometry args={[0.9 + i * 0.13, 0.012, 5, 64]} />
                <meshBasicMaterial
                  color={i === 1 ? "#d7b383" : "#76cbd8"}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            ))}
          </group>
        </group>
        {DOCUMENTS.map((document, i) => (
          <group key={document.id}>
            <DocumentNode
              document={document}
              index={i}
              motion={motionRef}
              relevant={query.sources.includes(document.id)}
              selected={source === document.id}
              onSelect={onSelect}
              interactive={interactive}
            />
            <mesh>
              <tubeGeometry args={[curves[i], 24, 0.009, 4, false]} />
              <meshBasicMaterial
                color={source === document.id ? "#f5c78c" : "#4294aa"}
                transparent
                opacity={source === document.id ? 0.9 : 0.3}
              />
            </mesh>
          </group>
        ))}
        <instancedMesh
          ref={packets}
          args={[null, null, 12]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={[1.2, 2.8, 3.5]} toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  );
}
