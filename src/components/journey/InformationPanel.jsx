import { useLayoutEffect } from "react";
import UniverseInfo from "./UniverseInfo";
import { cameraCSSMatrix, objectCSSMatrix, translationMatrix } from "../scene/panelProjection";

// Keep one persistent panel before and after WebGL starts. The scene updates
// its CSS projection during flight, without remounting any of its content.
export default function InformationPanel({ panel, content }) {
  const { id, inspection, layout, size, projectionRef } = panel;
  useLayoutEffect(() => {
    const view = projectionRef.current;
    if (view.connected || !view.camera || !view.object) return;
    // Start with the same projection as the docked camera. Switching from a
    // flat overlay to perspective after WebGL loads would repaint the content.
    const fov = layout.pixelsPerUnit * (layout.camera[2] - layout.target[2]);
    view.screen.style.perspective = `${fov}px`;
    view.camera.style.transform = `translateZ(${fov}px)${cameraCSSMatrix(translationMatrix(layout.camera.map(value => -value)))}translate(${size.width / 2}px,${size.height / 2}px)`;
    view.object.style.transform = objectCSSMatrix(translationMatrix(layout.panel), layout.pixelsPerUnit);
  }, [layout, size, projectionRef]);
  return (
    <div className="world-info-screen" ref={node => { projectionRef.current.screen = node; }}>
      <div className="world-info-camera" ref={node => { projectionRef.current.camera = node; }}>
        <div className="world-info-object" ref={node => { projectionRef.current.object = node; }}>
          <div style={{
            visibility: inspection ? "visible" : "hidden",
            opacity: inspection ? 1 : 0,
            transition: content.motion
              ? `opacity 220ms ease, visibility 0s ${inspection ? "0s" : "220ms"}`
              : "none",
            pointerEvents: inspection ? "auto" : "none",
            "--info-width": `${layout.panelWidth}px`,
            "--info-height": `${layout.panelHeight}px`,
          }}>
            <UniverseInfo id={id} active={!!inspection} {...content} />
          </div>
        </div>
      </div>
    </div>
  );
}
