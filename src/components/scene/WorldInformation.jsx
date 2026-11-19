/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { cameraCSSMatrix, objectCSSMatrix } from "./panelProjection";

export default function WorldInformation({
  inspection,
  stop,
  layout,
  projectionRef,
  isLight,
}) {
  const anchor = useRef();
  const vectors = useMemo(() => ({ position: new Vector3(), direction: new Vector3() }), []);
  const tether = useMemo(() => {
    const [x, y, z] = stop.target;
    const [px, py, pz] = layout.panel;
    const edgeX = layout.stacked
      ? px
      : px - (layout.side * layout.panelWidth) / layout.pixelsPerUnit / 2;
    const edgeY = layout.stacked
      ? py + layout.panelHeight / layout.pixelsPerUnit / 2
      : py;
    return new Float32Array(
      layout.stacked
        ? [x, y - 2.2, z, edgeX, edgeY, pz]
        : [x + layout.side * 3.6 * layout.modelScale, y, z, edgeX, edgeY, pz],
    );
  }, [stop, layout]);
  useEffect(() => {
    const view = projectionRef.current;
    view.connected = true;
    return () => { view.connected = false; };
  }, [projectionRef]);
  useFrame(({ camera, size }) => {
    const view = projectionRef.current;
    if (!anchor.current || !view.screen || !view.camera || !view.object) return;
    camera.updateMatrixWorld();
    anchor.current.updateWorldMatrix(true, false);
    vectors.position.setFromMatrixPosition(anchor.current.matrixWorld).sub(camera.position);
    camera.getWorldDirection(vectors.direction);
    const display = vectors.position.dot(vectors.direction) < 0 ? "none" : "block";
    const fov = camera.projectionMatrix.elements[5] * size.height / 2;
    const perspective = `${fov}px`;
    const cameraTransform = `translateZ(${fov}px)${cameraCSSMatrix(camera.matrixWorldInverse.elements)}translate(${size.width / 2}px,${size.height / 2}px)`;
    const objectTransform = objectCSSMatrix(anchor.current.matrixWorld.elements, layout.pixelsPerUnit);
    if (view.display !== display) { view.screen.style.display = display; view.display = display; }
    if (view.perspective !== perspective) { view.screen.style.perspective = perspective; view.perspective = perspective; }
    if (view.cameraTransform !== cameraTransform) { view.camera.style.transform = cameraTransform; view.cameraTransform = cameraTransform; }
    if (view.objectTransform !== objectTransform) { view.object.style.transform = objectTransform; view.objectTransform = objectTransform; }
  });
  return (
    <group name="world-information">
      <group ref={anchor} position={layout.panel} />
      <group visible={!!inspection}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[tether, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={isLight ? "#6a94a6" : "#8fc2d2"}
            transparent
            opacity={0.52}
          />
        </line>
      </group>
    </group>
  );
}
