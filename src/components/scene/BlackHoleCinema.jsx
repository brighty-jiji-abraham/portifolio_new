import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import { BLACK_HOLE_DURATION, BLACK_HOLE_FLIGHT } from "./blackHoleFlight";

// Owns the existing universe camera for the duration of a flight. No second canvas.
export default function BlackHoleCinema({ seek, paused, reducedMotion, onProgress, onReady, timeRef }) {
  const { get, size, invalidate } = useThree();
  const flight = useRef({ elapsed: 0, seek: null, reported: -1, resetClock: true, snapshot: null });
  const scratch = useMemo(() => ({ look: new Matrix4(), orientation: new Quaternion(), up: new Vector3(0, 1, 0) }), []);
  useLayoutEffect(() => {
    const state = flight.current;
    return () => {
      const { camera } = get();
      const initial = state.snapshot;
      if (!initial) return;
      camera.position.copy(initial.position);
      camera.quaternion.copy(initial.orientation);
      camera.fov = initial.fov;
      camera.zoom = initial.zoom;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      initial.hole.position.copy(initial.holePosition);
      initial.hole.quaternion.copy(initial.holeOrientation);
      initial.hole.scale.copy(initial.holeScale);
      const uniforms = initial.hole.material.uniforms;
      uniforms.cinematic.value = 0;
      uniforms.bank.value = 0;
      uniforms.inclination.value = 3.8;
      uniforms.exposure.value = 1;
      timeRef.current = initial.time;
      initial.skyThemes.forEach(([uniform, value]) => { uniform.value = value; });
      invalidate();
    };
  }, [get, invalidate, timeRef]);
  useEffect(() => {
    // Ignore the first delta after a pause/seek/resize or a background tab.
    flight.current.resetClock = true;
    invalidate();
  }, [seek, size, paused, reducedMotion, invalidate]);
  useFrame(({ camera, scene }, delta) => {
    const state = flight.current;
    if (!state.snapshot) {
      const hole = scene.getObjectByName("black-hole");
      if (!hole) { invalidate(); return; }
      state.snapshot = {
        position: camera.position.clone(), orientation: camera.quaternion.clone(),
        fov: camera.fov, zoom: camera.zoom, time: timeRef.current,
        hole, holePosition: hole.position.clone(), holeOrientation: hole.quaternion.clone(), holeScale: hole.scale.clone(),
        distance: camera.position.distanceTo(hole.position),
        skyThemes: ["deep-sky", "distant-stars"].map(name => {
          const uniform = scene.getObjectByName(name)?.material.uniforms.lightTheme;
          return uniform ? [uniform, uniform.value] : null;
        }).filter(Boolean),
      };
      onReady();
    }
    const initial = state.snapshot;
    const changed = state.seek !== seek;
    if (changed) {
      state.seek = seek;
      state.elapsed = MathUtils.clamp(seek.position, 0, BLACK_HOLE_DURATION);
    } else if (!paused && !reducedMotion && !state.resetClock) {
      state.elapsed = Math.min(BLACK_HOLE_DURATION, state.elapsed + delta);
    }
    state.resetClock = false;
    const elapsed = state.elapsed;
    let segment = BLACK_HOLE_FLIGHT.findIndex(key => key[0] > elapsed) - 1;
    if (segment < 0) segment = BLACK_HOLE_FLIGHT.length - 2;
    const from = BLACK_HOLE_FLIGHT[segment], to = BLACK_HOLE_FLIGHT[segment + 1];
    const progress = MathUtils.smootherstep(elapsed, from[0], to[0]);
    const finalRatio = Math.max(0.25, initial.holeScale.x * 0.008) / initial.distance;
    const destination = segment === BLACK_HOLE_FLIGHT.length - 2 ? finalRatio : to[1];
    const distanceRatio = Math.exp(MathUtils.lerp(Math.log(from[1]), Math.log(destination), progress));
    camera.position.lerpVectors(initial.holePosition, initial.position, distanceRatio);
    // A gentle upward arc leaves the nearby worlds below the flight path.
    camera.position.y += Math.sin(Math.PI * elapsed / BLACK_HOLE_DURATION) ** 2 * Math.min(12, initial.distance * 0.035);
    scratch.look.lookAt(camera.position, initial.holePosition, scratch.up);
    scratch.orientation.setFromRotationMatrix(scratch.look);
    camera.quaternion.slerpQuaternions(initial.orientation, scratch.orientation, MathUtils.smootherstep(elapsed, 0, 4));
    if (elapsed === 0) {
      camera.position.copy(initial.position);
      camera.quaternion.copy(initial.orientation);
    }
    camera.updateMatrixWorld();
    initial.hole.position.copy(initial.holePosition);
    initial.hole.scale.copy(initial.holeScale);
    const values = initial.hole.material.uniforms;
    values.bank.value = MathUtils.lerp(from[2], to[2], progress);
    values.inclination.value = MathUtils.lerp(from[3], to[3], progress);
    values.cinematic.value = MathUtils.smoothstep(elapsed, 5, 10);
    values.exposure.value = 1 - MathUtils.smoothstep(elapsed, 20.8, BLACK_HOLE_DURATION);
    timeRef.current = initial.time + elapsed;
    initial.skyThemes.forEach(([uniform, value]) => {
      uniform.value = value * (1 - MathUtils.smoothstep(elapsed, 0.5, 5));
    });
    if (changed || elapsed === BLACK_HOLE_DURATION || elapsed - state.reported >= 0.12) {
      if (state.reported !== elapsed) onProgress(elapsed);
      state.reported = elapsed;
    }
  }, -0.6);
  return null;
}
