// Imports let Vite fingerprint the maps for safe, long-lived browser caching.
// Keep the original resolutions, coordinates, alpha, lighting and shaders.
import sky from "./nasa-starmap.webp";
import earth from "./earth-color.webp";
import night from "./earth-lights.webp";
import clouds from "./earth-clouds.webp";
import water from "./earth_specular.jpg";
import moon from "./nasa-moon.jpg";
import moonHeight from "./nasa-moon-height.jpg";
import reflections from "./room-environment.png";
import originalSky from "./nasa-starmap.jpg";
import originalEarth from "./earth_color.jpg";
import lightSky from "./light/sky.webp";
import lightEarth from "./light/earth.webp";
import lightNight from "./light/night.webp";
import lightClouds from "./light/clouds.webp";
import lightWater from "./light/water.webp";
import lightMoon from "./light/moon.webp";
import lightMoonHeight from "./light/moon-height.webp";
import lightReflections from "./room-environment-light.png";

const balanced = { sky, earth, night, clouds, water, moon, moonHeight, reflections };
export const universeTextureSets = {
  balanced,
  original: { ...balanced, sky: originalSky, earth: originalEarth },
  light: { sky: lightSky, earth: lightEarth, night: lightNight, clouds: lightClouds,
    water: lightWater, moon: lightMoon, moonHeight: lightMoonHeight, reflections: lightReflections },
};
