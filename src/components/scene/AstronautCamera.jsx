import { blurScenePanel } from "./scenePlatform";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { UNIVERSE_STOPS } from "../journey/destinations";
import { spatialLayout } from "../journey/spatialLayout";
import { createFlightPath, flightProgress } from "./flightPath";

const MOVEMENT = ["KeyW", "KeyS", "KeyA", "KeyD", "KeyQ", "KeyE"];

export default function AstronautCamera({ flight: flightRef, reducedMotion, disabled = false }) {
  const { gl, size } = useThree();
  const state = useRef({
    session: 0,
    command: null,
    yaw: 0,
    pitch: 0,
    roll: 0,
    route: null,
    reportTime: 0,
  });
  const vectors = useRef(null);
  if (vectors.current === null) {
    vectors.current = {
      velocity: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      look: new THREE.Vector3(),
      target: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      ahead: new THREE.Vector3(),
      orientation: new THREE.Quaternion(),
      bank: new THREE.Quaternion(),
      axis: new THREE.Vector3(0, 0, 1),
      euler: new THREE.Euler(0, 0, 0, "YXZ"),
    };
  }
  const pose = (stop, reading = false) => {
    if (reading) {
      const layout = spatialLayout(stop, size.width, size.height);
      return {
        target: new THREE.Vector3(...layout.target),
        position: new THREE.Vector3(...layout.camera),
      };
    }
    const target = new THREE.Vector3(...stop.target);
    return {
      target,
      position: target
        .clone()
        .add(new THREE.Vector3(0, 0.65, size.width < 760 ? 20 : 13.8)),
    };
  };
  useEffect(() => {
    const canvas = gl.domElement;
    let pointer = null;
    const down = (event) => {
      if (!flightRef.current.enabled || event.button !== 0) return;
      blurScenePanel();
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        total: 0,
      };
      flightRef.current.dragged = false;
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.total += Math.abs(dx) + Math.abs(dy);
      if (pointer.total > 5) flightRef.current.dragged = true;
      if (
        !["projects", "skills", "experience"].includes(flightRef.current.reading)
      ) {
        flightRef.current.lookX += dx;
        flightRef.current.lookY += dy;
      }
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
    };
  }, [flightRef, gl]);
  useFrame(({ camera }, delta) => {
    const control = flightRef.current;
    if (!control.enabled || disabled) return;
    const dt = Math.min(delta, 0.05);
    const current = state.current;
    const v = vectors.current;
    v.previous.copy(camera.position);
    control.reducedMotion = reducedMotion;
    const syncAngles = () => {
      v.euler.setFromQuaternion(camera.quaternion, "YXZ");
      current.yaw = v.euler.y;
      current.pitch = v.euler.x;
      current.roll = v.euler.z;
    };
    if (current.session !== control.session) {
      const start = pose(
        UNIVERSE_STOPS.find((entry) => entry.id === control.start) ||
          UNIVERSE_STOPS[0],
        !!control.reading,
      );
      camera.position.copy(start.position);
      camera.lookAt(start.target);
      camera.fov = 55;
      camera.updateProjectionMatrix();
      current.session = control.session;
      current.route = null;
      current.command = null;
      v.velocity.set(0, 0, 0);
      syncAngles();
    }
    const layoutKey = `${size.width}:${size.height}`;
    if (control.reading && current.layoutKey !== layoutKey) {
      const readingPose = pose(
        UNIVERSE_STOPS.find((entry) => entry.id === control.reading),
        true,
      );
      camera.position.copy(readingPose.position);
      camera.lookAt(readingPose.target);
      syncAngles();
    }
    if (current.route && current.layoutKey !== layoutKey) {
      // Rebuild from the current pose when a phone rotates during a flight.
      control.command = {
        id: current.route.id,
        inspect: current.route.inspect,
      };
    }
    current.layoutKey = layoutKey;
    if (control.command && control.command !== current.command) {
      current.command = control.command;
      control.keys.clear();
      if (control.command.id === "stop") {
        current.route = null;
        v.velocity.set(0, 0, 0);
        syncAngles();
      } else {
        const stop = UNIVERSE_STOPS.find(
          (entry) => entry.id === control.command.id,
        );
        if (stop) {
          const end = pose(stop, control.command.inspect);
          if (reducedMotion) {
            camera.position.copy(end.position);
            camera.lookAt(end.target);
            camera.fov = 55;
            camera.updateProjectionMatrix();
            current.route = null;
            v.velocity.set(0, 0, 0);
            syncAngles();
            if (control.command.inspect) control.onInspect?.(stop.id);
          } else {
            const from = camera.position.clone();
            const distance = from.distanceTo(end.position);
            camera.getWorldDirection(v.forward);
            if (v.velocity.length() > 0.5)
              v.forward.copy(v.velocity).normalize();
            const path = createFlightPath(from, end.position, v.forward);
            const duration =
              distance < 3
                ? 1.2
                : THREE.MathUtils.clamp(
                    2.6 + Math.sqrt(path.getLength()) * 0.36,
                    3.8,
                    8.2,
                  );
            current.route = {
              id: stop.id,
              elapsed: 0,
              duration,
              path,
              momentum: THREE.MathUtils.clamp(
                (v.velocity.length() * duration) /
                  Math.max(path.getLength(), 1),
                0,
                1.5,
              ),
              quaternion: camera.quaternion.clone(),
              initialFov: camera.fov,
              target: end.target,
              inspect: control.command.inspect,
            };
          }
        }
      }
    }
    const keys = control.keys;
    const looking =
      Math.abs(control.lookX) + Math.abs(control.lookY) > 0.1 ||
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].some((key) =>
        keys.has(key),
      );
    const moving = MOVEMENT.some((key) => keys.has(key));
    if (reducedMotion && current.route) {
      const route = current.route;
      camera.position.copy(route.path.v3);
      camera.lookAt(route.target);
      camera.fov = 55;
      camera.updateProjectionMatrix();
      current.route = null;
      control.travel = null;
      v.velocity.set(0, 0, 0);
      syncAngles();
      if (route.inspect) control.onInspect?.(route.id);
    }
    if ((moving || looking) && current.route) {
      current.route = null;
      v.velocity.multiplyScalar(0.25);
      syncAngles();
    }
    if (current.route) {
      const route = current.route;
      route.elapsed += dt;
      const t = Math.min(1, route.elapsed / route.duration);
      const ease = flightProgress(t, route.momentum);
      route.path.getPointAt(ease, camera.position);
      route.path.getPointAt(Math.min(1, ease + 0.08), v.ahead);
      const arrival = THREE.MathUtils.smootherstep(t, 0.5, 0.93);
      v.look.copy(v.ahead).lerp(route.target, arrival);
      camera.lookAt(v.look);
      v.orientation.copy(camera.quaternion);
      const turn =
        route.path.getTangentAt(Math.min(1, ease + 0.02)).x -
        route.path.getTangentAt(Math.max(0, ease - 0.02)).x;
      const bank =
        THREE.MathUtils.clamp(-turn * 0.5, -0.055, 0.055) *
        Math.sin(Math.PI * t);
      v.orientation.multiply(v.bank.setFromAxisAngle(v.axis, bank));
      camera.quaternion.slerpQuaternions(
        route.quaternion,
        v.orientation,
        THREE.MathUtils.smootherstep(t, 0, 0.3),
      );
      const fov =
        55 +
        6 * Math.sin(Math.PI * t) ** 2 +
        (route.initialFov - 55) * (1 - THREE.MathUtils.smootherstep(t, 0, 0.3));
      camera.fov = fov;
      camera.updateProjectionMatrix();
      v.velocity
        .copy(camera.position)
        .sub(v.previous)
        .divideScalar(Math.max(dt, 0.001));
      control.travel = {
        id: route.id,
        progress: t,
        speed: v.velocity.length(),
        phase: t < 0.2 ? "Departing" : t > 0.76 ? "Arriving" : "In flight",
      };
      if (t === 1) {
        current.route = null;
        camera.lookAt(route.target);
        v.velocity.set(0, 0, 0);
        syncAngles();
        if (route.inspect) control.onInspect?.(route.id);
      }
    } else {
      control.travel = null;
      current.yaw -=
        control.lookX * 0.003 +
        ((keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0)) *
          dt;
      current.pitch -=
        control.lookY * 0.003 +
        ((keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0)) * dt;
      current.pitch = THREE.MathUtils.clamp(current.pitch, -1.4, 1.4);
      current.roll = THREE.MathUtils.damp(current.roll, 0, 5, dt);
      v.euler.set(current.pitch, current.yaw, current.roll);
      camera.quaternion.setFromEuler(v.euler);
      if (Math.abs(camera.fov - 55) > 0.001) {
        camera.fov = THREE.MathUtils.damp(camera.fov, 55, 5, dt);
        camera.updateProjectionMatrix();
      }
      camera.getWorldDirection(v.forward);
      v.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      v.desired
        .set(0, 0, 0)
        .addScaledVector(
          v.forward,
          (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0),
        )
        .addScaledVector(
          v.right,
          (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0),
        );
      v.desired.y += (keys.has("KeyE") ? 1 : 0) - (keys.has("KeyQ") ? 1 : 0);
      const speed = reducedMotion
        ? 5
        : keys.has("ShiftLeft") || keys.has("ShiftRight")
          ? 26
          : 10;
      v.desired.normalize().multiplyScalar(speed);
      v.velocity.lerp(v.desired, 1 - Math.exp(-4.5 * dt));
      camera.position.addScaledVector(v.velocity, dt);
    }
    control.lookX = 0;
    control.lookY = 0;
    if (control.reading) {
      const landmark = UNIVERSE_STOPS.find(
        (entry) => entry.id === control.reading,
      );
      v.target.set(...landmark.target);
      camera.getWorldDirection(v.forward);
      v.offset.copy(v.target).sub(camera.position);
      if (v.offset.length() > 48 || v.offset.normalize().dot(v.forward) < -0.1)
        control.dismissInformation?.({ preserveKeys: true });
    }
    // A soft surface keeps the astronaut outside the solid planets.
    for (const [center, radius] of [
      [UNIVERSE_STOPS[0].target, 2.35],
      [UNIVERSE_STOPS[4].target, 2.35],
    ]) {
      v.target.set(...center);
      v.offset.copy(camera.position).sub(v.target);
      const length = v.offset.length();
      if (length < radius) {
        if (length < 0.001) v.offset.set(0, 0, 1);
        camera.position
          .copy(v.target)
          .add(v.offset.normalize().multiplyScalar(radius));
        v.velocity.set(0, 0, 0);
      }
    }
    current.reportTime += dt;
    if (current.reportTime > 0.25) {
      current.reportTime = 0;
      let nearest = UNIVERSE_STOPS[0];
      let distance = Infinity;
      UNIVERSE_STOPS.forEach((stop) => {
        const d = camera.position.distanceTo(v.target.set(...stop.target));
        if (d < distance) {
          nearest = stop;
          distance = d;
        }
      });
      control.report?.({
        nearest: nearest.id,
        distance,
        speed: v.velocity.length(),
        destination: current.route?.id || null,
        progress: control.travel?.progress || 0,
        phase: control.travel?.phase || null,
        position: camera.position.toArray().map((n) => Math.round(n * 10) / 10),
      });
    }
  }, -0.75);
  return null;
}
