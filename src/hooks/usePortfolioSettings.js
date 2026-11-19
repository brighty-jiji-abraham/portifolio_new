import { useCallback, useLayoutEffect, useState } from "react";
import { useSoundscape } from "./useSoundscape";
import { QUALITY_MODES } from "../components/scene/qualityPolicy";

function initialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* The theme still works when storage is unavailable. */
  }
  return "dark";
}

export function usePortfolioSettings() {
  const [theme, setTheme] = useState(initialTheme);
  const [qualityMode, setQuality] = useState(() => {
    try {
      const saved = localStorage.getItem("graphics-quality");
      return QUALITY_MODES.includes(saved) ? saved : "auto";
    } catch { return "auto"; }
  });
  const setQualityMode = useCallback(mode => {
    if (!QUALITY_MODES.includes(mode)) return;
    setQuality(mode);
    try { localStorage.setItem("graphics-quality", mode); } catch { /* Optional persistence. */ }
  }, []);
  const sound = useSoundscape();
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f4f7fa" : "#080f18");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* Optional persistence. */
    }
  }, [theme]);
  const toggleTheme = useCallback(
    () => setTheme((value) => (value === "light" ? "dark" : "light")),
    [],
  );
  return { theme, toggleTheme, qualityMode, setQualityMode, ...sound };
}
