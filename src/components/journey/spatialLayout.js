// Shared camera and panel composition, expressed as positions in the universe.
export function spatialLayout(stop, width, height) {
  const compact = width < 1000;
  const landscape = width >= 640 && height < 600;
  const stacked = compact && !landscape;
  const hero = stop.id === "about" && !compact && !landscape;
  const tangent = 2 * Math.tan((55 * Math.PI) / 360);
  const contentWidth = Math.min(1500, width - 80);
  const gutter = (width - contentWidth) / 2;
  const panelWidth = stacked
    ? Math.min(440, width - 40)
    : landscape
      ? Math.min(440, width * 0.45)
      : Math.min(hero ? 520 : 460, contentWidth * 0.38);
  const panelHeight = stacked
    ? Math.max(230, height - 420)
    : landscape
      ? Math.max(180, height - 158)
      : Math.min(hero ? 760 : 700, height - 220);
  const panelX = stacked
    ? width / 2
    : landscape
      ? width - 24 - panelWidth / 2
      : hero
        ? gutter + panelWidth / 2
        : width - gutter - panelWidth / 2;
  const panelY = stacked
    ? height - 28 - panelHeight / 2
    : landscape
      ? height / 2 + 55
      : height / 2 + 65;
  const modelX = stacked
    ? width / 2
    : landscape
      ? width * 0.25
      : hero
        ? gutter + panelWidth + (contentWidth - panelWidth) / 2
        : gutter + (contentWidth - panelWidth) / 2;
  const modelY = stacked
    ? (172 + height - 28 - panelHeight) / 2
    : landscape
      ? height / 2 + 55
      : height / 2 + 65;
  const maximumScale =
    compact || landscape
      ? 38
      : Math.max(
          24,
          Math.min(
            (contentWidth - panelWidth - 90) / 8.7,
            (height - 250) / 8.4,
          ),
        );
  const distance = Math.max(
    landscape ? 10 : compact ? 20 : 10.5,
    height / (tangent * maximumScale),
  );
  const pixelsPerUnit = height / (tangent * distance);
  const [x, y, z] = stop.target;
  const cameraX = x + (width / 2 - modelX) / pixelsPerUnit;
  const cameraY = y + (modelY - height / 2) / pixelsPerUnit;
  return {
    stacked,
    side: panelX > modelX ? 1 : -1,
    panelWidth,
    panelHeight,
    pixelsPerUnit,
    camera: [cameraX, cameraY, z + distance],
    target: [cameraX, cameraY, z],
    panel: [
      cameraX + (panelX - width / 2) / pixelsPerUnit,
      cameraY + (height / 2 - panelY) / pixelsPerUnit,
      z,
    ],
    distanceFactor: 400 / pixelsPerUnit,
    modelScale:
      compact || landscape
        ? stop.id === "about" || stop.id === "contact"
          ? 0.7
          : 0.57
        : 1,
  };
}
