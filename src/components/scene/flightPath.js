import { CubicBezierCurve3, MathUtils, Vector3 } from "three";

export const FLIGHT_OBSTACLES = [
  { center: [0, 0, 0], radius: 3.2 },
  { center: [-12, -6, -145], radius: 3.2 },
];

// Zero acceleration at either end; a retarget can carry its incoming speed.
export function flightProgress(t, momentum = 0) {
  return MathUtils.clamp(
    t ** 3 * (10 - 15 * t + 6 * t * t) +
      momentum * (t - 6 * t ** 3 + 8 * t ** 4 - 3 * t ** 5),
    0,
    1,
  );
}

export function createFlightPath(from, to, forward) {
  const distance = from.distanceTo(to);
  const side = Math.sign(to.x - from.x) || 1;
  const reach = Math.min(distance * 0.18, 9);
  const a = from
    .clone()
    .addScaledVector(forward, reach)
    .add(
      new Vector3(
        side * Math.min(distance * 0.1, 7),
        Math.min(distance * 0.09, 4),
        0,
      ),
    );
  const b = to
    .clone()
    .add(
      new Vector3(
        -side * Math.min(distance * 0.08, 5),
        Math.min(distance * 0.06, 3),
        Math.min(distance * 0.24, 12),
      ),
    );
  let path;
  const point = new Vector3();
  // Raise the flight corridor above the planetary exhibits.
  for (let attempt = 0; attempt < 14; attempt++) {
    path = new CubicBezierCurve3(
      from.clone(),
      a.clone(),
      b.clone(),
      to.clone(),
    );
    const collision = FLIGHT_OBSTACLES.some(({ center, radius }) => {
      const c = new Vector3(...center);
      const safeRadius = Math.min(
        radius + 0.5,
        from.distanceTo(c) - 0.05,
        to.distanceTo(c) - 0.05,
      );
      for (let i = 1; i < 128; i++)
        if (path.getPoint(i / 128, point).distanceTo(c) < safeRadius)
          return true;
      return false;
    });
    if (!collision) break;
    a.y += 4;
    b.y += 4;
  }
  path.arcLengthDivisions = 300;
  path.updateArcLengths();
  return path;
}
