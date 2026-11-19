import { createContext } from "react";
import { universeTextureSets } from "../../assets/universe/textures";

export const SceneQualityContext = createContext({
  textures: universeTextureSets.balanced,
  level: 1,
  anisotropy: 4,
});
