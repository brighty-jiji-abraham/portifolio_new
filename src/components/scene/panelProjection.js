// The perspective projection used by Drei's transform-mode Html, without
// coupling the initial content render to the Three.js renderer.
const cameraSigns = [1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1];
const objectSigns = [1, 1, 1, 1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1];
const clean = value => Math.abs(value) < 1e-10 ? 0 : value;

export function translationMatrix([x, y, z]) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

export function cameraCSSMatrix(elements) {
  return `matrix3d(${elements.map((value, index) => clean(value * cameraSigns[index])).join(",")})`;
}

export function objectCSSMatrix(elements, pixelsPerUnit) {
  return `translate(-50%,-50%)matrix3d(${elements.map((value, index) =>
    clean(value * objectSigns[index] / (index < 12 && index % 4 !== 3 ? pixelsPerUnit : 1)),
  ).join(",")})`;
}
