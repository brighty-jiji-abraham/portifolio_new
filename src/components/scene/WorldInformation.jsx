/* eslint-disable react/no-unknown-property */
import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { UNIVERSE_STOPS } from "../journey/destinations";
import { spatialLayout } from "../journey/spatialLayout";
import UniverseInfo from "../journey/UniverseInfo";

export default function WorldInformation({
  inspection,
  portal,
  isLight,
  content,
}) {
  const { size } = useThree();
  const [previous, setPrevious] = useState("about");
  if (inspection && inspection !== previous) setPrevious(inspection);
  const id = inspection || previous;
  const stop = UNIVERSE_STOPS.find((item) => item.id === id);
  const layout = useMemo(
    () => spatialLayout(stop, size.width, size.height),
    [stop, size.width, size.height],
  );
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
  return (
    <group name="world-information">
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
      <Html
        transform
        position={layout.panel}
        distanceFactor={layout.distanceFactor}
        portal={portal}
        zIndexRange={[2, 2]}
        pointerEvents={inspection ? "auto" : "none"}
        style={{
          visibility: inspection ? "visible" : "hidden",
          opacity: inspection ? 1 : 0,
          transition: content.motion
            ? `opacity 220ms ease, visibility 0s ${inspection ? "0s" : "220ms"}`
            : "none",
          pointerEvents: inspection ? "auto" : "none",
          "--info-width": `${layout.panelWidth}px`,
          "--info-height": `${layout.panelHeight}px`,
        }}
      >
        <UniverseInfo id={id} active={!!inspection} {...content} />
      </Html>
    </group>
  );
}
