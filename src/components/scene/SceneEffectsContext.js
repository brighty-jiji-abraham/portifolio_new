import { createContext } from "react";

export const SceneEffectsContext = createContext({
  playProjectCue: () => {}, stopProjectSounds: () => {},
});
