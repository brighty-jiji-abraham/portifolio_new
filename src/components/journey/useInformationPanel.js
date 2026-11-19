import { useEffect, useMemo, useRef, useState } from "react";
import { UNIVERSE_STOPS } from "./destinations";
import { spatialLayout } from "./spatialLayout";

export default function useInformationPanel(inspection) {
  const [previous, setPrevious] = useState(inspection || "about");
  if (inspection && inspection !== previous) setPrevious(inspection);
  const id = inspection || previous;
  const [size, setSize] = useState(() => ({ width: innerWidth, height: innerHeight }));
  const projectionRef = useRef({ connected: false });
  useEffect(() => {
    const resize = () => setSize({ width: innerWidth, height: innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const stop = UNIVERSE_STOPS.find(item => item.id === id);
  const layout = useMemo(() => spatialLayout(stop, size.width, size.height), [stop, size.width, size.height]);
  return { id, stop, inspection, layout, size, projectionRef };
}
