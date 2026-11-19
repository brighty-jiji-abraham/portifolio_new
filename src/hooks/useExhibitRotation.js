import { setSceneCursor } from "../components/scene/scenePlatform";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";

// The camera owns free flight; an exhibit owns drag only while its information is open.
export function useExhibitRotation(id, journeyRef, reset, limits = [0.4, 0.85], timeRef) {
  const group = useRef();
  const target = useRef({ x: 0, y: 0 });
  const { gl } = useThree();
  const limitX = limits[0],
    limitY = limits[1];
  useEffect(() => {
    target.current = { x: 0, y: 0 };
  }, [reset]);
  useEffect(() => {
    const canvas = gl.domElement;
    let pointer = null;
    const down = (event) => {
      if (event.button !== 0 || journeyRef.current.explorer?.reading !== id)
        return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const move = (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (journeyRef.current.explorer?.reading !== id) {
        pointer = null;
        return;
      }
      target.current.x = MathUtils.clamp(
        target.current.x + (event.clientY - pointer.y) * 0.004,
        -limitX,
        limitX,
      );
      target.current.y = MathUtils.clamp(
        target.current.y + (event.clientX - pointer.x) * 0.006,
        -limitY,
        limitY,
      );
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const up = () => {
      pointer = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    globalThis.addEventListener("blur", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      globalThis.removeEventListener("blur", up);
      setSceneCursor("");
    };
  }, [gl, id, journeyRef, limitX, limitY]);
  useFrame((_, dt) => {
    if (!group.current) return;
    const still = journeyRef.current.explorer?.motionOff;
    const time = timeRef?.current || 0;
    for (const axis of ["x", "y"]) {
      const drift = axis === "x" ? Math.sin(time * 0.12) * 0.018 : Math.sin(time * 0.09) * 0.03;
      const angle = target.current[axis] + drift;
      group.current.rotation[axis] = still
        ? angle
        : MathUtils.damp(
            group.current.rotation[axis],
            angle,
            7,
            Math.min(dt, 0.05),
          );
    }
  });
  return group;
}
