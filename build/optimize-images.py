"""Build full-resolution and lightweight variants of the same scene assets.

Run with Python + Pillow: python build/optimize-images.py
The original NASA/Earth maps remain in public/; attribution is in textures/CREDITS.txt.
"""
from pathlib import Path
from shutil import copyfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/assets/universe"
OUT.mkdir(parents=True, exist_ok=True)

for source, target, options in [
    ("textures/nasa-starmap.jpg", "nasa-starmap.webp", {"quality": 90}),
    ("textures/earth_color.jpg", "earth-color.webp", {"quality": 92}),
    ("earth-lights.png", "earth-lights.webp", {"lossless": True}),
    ("textures/earth_clouds.png", "earth-clouds.webp", {"lossless": True}),
]:
    with Image.open(ROOT / "public" / source) as image:
        # Clouds use alpha in the shader. Preserve it losslessly.
        image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB").save(
            OUT / target, "WEBP", method=6, **options
        )

# These data maps are already smaller in their existing format. Keep every byte.
for name in ["earth_specular.jpg", "nasa-moon-height.jpg", "nasa-moon.jpg", "nasa-starmap.jpg", "earth_color.jpg"]:
    copyfile(ROOT / "public/textures" / name, OUT / name)

light = OUT / "light"
light.mkdir(exist_ok=True)
for source, target, width, lossless in [
    ("textures/nasa-starmap.jpg", "sky.webp", 2048, False),
    ("textures/earth_color.jpg", "earth.webp", 1024, False),
    ("earth-lights.png", "night.webp", 1024, True),
    ("textures/earth_clouds.png", "clouds.webp", 512, True),
    ("textures/earth_specular.jpg", "water.webp", 1024, True),
    ("textures/nasa-moon.jpg", "moon.webp", 1024, False),
    ("textures/nasa-moon-height.jpg", "moon-height.webp", 512, True),
]:
    with Image.open(ROOT / "public" / source) as image:
        image = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS).save(
            light / target, "WEBP", quality=88, lossless=lossless, method=6
        )

with Image.open(ROOT / "src/assets/profile-img.jpg") as image:
    image.resize((256, 256), Image.Resampling.LANCZOS).save(
        ROOT / "src/assets/profile-thumbnail.webp", "WEBP", quality=94, method=6
    )

# The bake tool produces an opaque PNG with packed HDR bytes. Recompress losslessly.
for reflection in OUT.glob("room-environment*.png"):
    with Image.open(reflection) as image:
        image.convert("RGB").save(reflection, optimize=True)

for path in sorted(OUT.iterdir()):
    if path.suffix in (".webp", ".jpg", ".png"):
        print(f"{path.name}: {path.stat().st_size:,} bytes")
