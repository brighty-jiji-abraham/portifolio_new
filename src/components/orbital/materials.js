import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

// Authored panel and solar-cell surfaces, generated locally with deterministic wear.
export function makeSurface(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const solar = kind === "solar";
  ctx.fillStyle = solar ? "#142d48" : "#a8b3b7";
  ctx.fillRect(0, 0, 512, 512);
  let seed = 117;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 3500; i++) {
    ctx.fillStyle = `rgba(${solar ? "153,192,220" : "40,50,62"},${random() * 0.09})`;
    ctx.fillRect(random() * 512, random() * 512, solar ? 1 : 12, 1);
  }
  const width = solar ? 64 : 256;
  const height = solar ? 128 : 256;
  for (let x = 0; x < 512; x += width) {
    for (let y = 0; y < 512; y += height) {
      ctx.strokeStyle = solar ? "#91a3a5" : "#47545c";
      ctx.lineWidth = solar ? 2 : 3;
      ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);
      ctx.strokeStyle = solar ? "#2a4d69" : "#c4cccf";
      ctx.lineWidth = 1;
      if (solar) {
        for (let n = 8; n < height; n += 6) {
          ctx.beginPath();
          ctx.moveTo(x + 5, y + n);
          ctx.lineTo(x + width - 5, y + n);
          ctx.stroke();
        }
      } else {
        ctx.strokeRect(x + 7, y + 7, width - 14, height - 14);
        for (const dx of [14, width - 14])
          for (const dy of [14, height - 14]) {
            ctx.fillStyle = "#4d5a62";
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        ctx.fillStyle = "#687b85";
        ctx.font = "10px monospace";
        ctx.fillText("ORBITAL / 07", x + 18, y + height - 20);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}
