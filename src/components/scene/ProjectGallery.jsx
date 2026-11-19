/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import ProjectPreview from "./ProjectPreview";
import * as THREE from "three";
import { projects } from "../../data/projects";
import { projectVisuals } from "../../data/projectVisuals";
import FittedWorld from "./FittedWorld";
import ProjectSculpture from "./ProjectSculpture";

function Label({ text, color, position, width = 6, size = 36 }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.font = `500 ${size}px "Segoe UI", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128, 990);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [text, color, size]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / 4]} />
      <meshBasicMaterial
        map={map}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function ProjectGallery({
  journey,
  timeRef,
  selected,
  onSelect,
  isLight,
}) {
  const assembly = useRef();
  const reveal = useRef(1);
  const last = useRef(selected);
  const drag = useRef(null);
  const rotation = useRef({ x: 0, y: 0 });
  const { gl, size } = useThree();
  const compact = size.width < 1000 || size.height < 600;
  const visual = projectVisuals[selected];
  const sculptureColor = isLight
    ? new THREE.Color(visual.color).multiplyScalar(0.68).getStyle()
    : visual.color;
  const slots = (compact ? [-1, 0, 1] : [-2, -1, 0, 1, 2]).map(
    (offset) => (selected + offset + projects.length) % projects.length,
  );
  useEffect(() => {
    const canvas = gl.domElement;
    const down = (e) => {
      if (journey.current.explorer?.reading !== "projects" || e.button !== 0)
        return;
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const move = (e) => {
      if (!drag.current) return;
      rotation.current.y += (e.clientX - drag.current.x) * 0.007;
      rotation.current.x = THREE.MathUtils.clamp(
        rotation.current.x + (e.clientY - drag.current.y) * 0.004,
        -0.6,
        0.6,
      );
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      drag.current = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, [gl, journey]);
  useFrame((_, dt) => {
    const still = journey.current.explorer?.motionOff;
    if (last.current !== selected) {
      last.current = selected;
      reveal.current = still ? 1 : 0;
      rotation.current = { x: 0, y: 0 };
    }
    reveal.current = still
      ? 1
      : Math.min(1, reveal.current + Math.min(dt, 0.05) * 1.5);
    const ease = 1 - (1 - reveal.current) ** 3;
    assembly.current.scale.setScalar((compact ? 1.35 : 1) * (0.8 + ease * 0.2));
    assembly.current.position.y =
      (compact ? 1.25 : 0.45) +
      (1 - ease) * -0.4 +
      Math.sin(timeRef.current * 0.65) * 0.07;
    assembly.current.rotation.x = THREE.MathUtils.damp(
      assembly.current.rotation.x,
      rotation.current.x,
      8,
      Math.min(dt, 0.05),
    );
    assembly.current.rotation.y = THREE.MathUtils.damp(
      assembly.current.rotation.y,
      rotation.current.y +
        Math.sin(timeRef.current * 0.22) * 0.13 +
        (1 - ease) * -0.5,
      8,
      Math.min(dt, 0.05),
    );
  });
  return (
    <FittedWorld id="projects" index={2} journey={journey}>
      {!compact && (
        <Label
          text={`Selected work / ${selected + 1} of ${projects.length}`}
          color={isLight ? "#526d80" : "#9cb6c9"}
          position={[0, 3.15, 0]}
          size={27}
        />
      )}
      <group ref={assembly} name="project-sculpture" position={[0, 0.45, 0]}>
        <ProjectSculpture
          key={selected}
          animation={visual.animation}
          color={sculptureColor}
          timeRef={timeRef}
          isLight={isLight}
        />
      </group>
      {!compact && (
        <Label
          text={visual.shortTitle}
          color={isLight ? "#294b62" : "#e0e9ed"}
          position={[0, -1.95, 0.5]}
          width={6.2}
          size={42}
        />
      )}
      {slots.map((index, slot) => (
        <ProjectPreview
          key={index}
          index={index}
          active={index === selected}
          position={
            compact
              ? [(slot - 1) * 4.0, -3.1, 0]
              : [(slot - 2) * 1.35, -3.0, -Math.abs(slot - 2) * 0.12]
          }
          compact={compact}
          onSelect={onSelect}
          isLight={isLight}
          journey={journey}
        />
      ))}
      {!compact && (
        <Label
          text="Drag to rotate · Choose a project"
          color={isLight ? "#526d80" : "#9cb6c9"}
          position={[0, -4.05, 0]}
          size={25}
        />
      )}
      <pointLight
        color="#e7f4ff"
        intensity={isLight ? 38 : 65}
        position={[-3, 4, 4]}
        distance={14}
      />
      <pointLight
        color={visual.color}
        intensity={isLight ? 22 : 38}
        position={[3, -1, 3]}
        distance={12}
      />
      <pointLight
        color="#acd9ee"
        intensity={isLight ? 28 : 50}
        position={[0, 2, -4]}
        distance={12}
      />
    </FittedWorld>
  );
}
