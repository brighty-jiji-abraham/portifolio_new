import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";

function materialSignature(scene) {
  const versions = [scene.environment?.uuid || ""];
  scene.traverse(object => {
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) versions.push(`${material.id}:${material.version}`);
  });
  return versions.join(";");
}

// Submit shader work first, then poll Three's program readiness on later frames.
// Unlike a synchronous first draw, KHR_parallel_shader_compile lets the browser
// paint and respond while the driver prepares these exact same shaders.
export default function StartupRenderer({ onReady }) {
  const startup = useRef({ signature: null, stable: 0, rendered: false, complete: false, prepared: new WeakSet() });
  useFrame(({ gl, scene, camera, invalidate }) => {
    const state = startup.current;
    if (gl.getContext().isContextLost()) return;
    if (!state.complete) {
      if (!scene.children.length) { invalidate(); return; }
      const signature = materialSignature(scene);
      if (signature !== state.signature) {
        gl.compile(scene, camera);
        // Compiling double-sided materials can increment their version.
        state.signature = materialSignature(scene);
        state.stable = 0;
        // Submit the command queue and let the browser paint before querying
        // uniforms, including on drivers without parallel-compile reporting.
        gl.getContext().flush();
        invalidate();
        return;
      }
      // WebGLProgram.isReady uses the non-blocking extension when available;
      // browsers without it keep Three's normal rendering behavior.
      const deadline = performance.now() + 6;
      for (const program of gl.info.programs) {
        if (state.prepared.has(program)) continue;
        if (!(program.isReady?.() ?? true)) { invalidate(); return; }
        // Uniform/attribute discovery can still block on drivers without KHR.
        // Spread that first-use work across frames instead of one long draw.
        program.getUniforms();
        program.getAttributes();
        state.prepared.add(program);
        if (performance.now() >= deadline) { invalidate(); return; }
      }
    }
    gl.render(scene, camera);
    if (!state.rendered) {
      state.rendered = true;
      onReady();
    }
    if (!state.complete) {
      state.signature = materialSignature(scene);
      state.stable = useProgress.getState().active ? 0 : state.stable + 1;
      state.complete = state.stable >= 3;
      if (!state.complete) invalidate();
    }
  }, 1);
  return null;
}
