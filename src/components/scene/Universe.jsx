/* eslint-disable react/no-unknown-property */
import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { spatialLayout } from "../journey/spatialLayout";
import { UNIVERSE_STOPS } from "../journey/destinations";
import OpenSpace from "./OpenSpace";
import BlackHole from "./BlackHole";
import BlackHoleCinema from "./BlackHoleCinema";
import SceneReflections from "./SceneReflections";
import NeuralSkills from "./NeuralSkills";
import EarthWorld from "./EarthWorld";
import { ProjectGallery, ContactEarth } from "./WorldModels";
import CareerConstellation from "./CareerConstellation";
import AstronautCamera from "./AstronautCamera";
import WorldInformation from "./WorldInformation";
import FlightDust from "./FlightDust";

export default function Universe({
  journey: journeyRef,
  reducedMotion,
  paused,
  isLight,
  category,
  selected,
  onSelect,
  neuralPulse,
  networkReset,
  skyReset,
  project,
  onProject,
  milestone,
  onMilestone,
  signal,
  flight,
  information,
  cinema,
  cinemaActive,
}) {
  const world = useRef();
  const timeRef = useRef(0);
  const { size } = useThree();
  const informationScale = spatialLayout(
    UNIVERSE_STOPS[0],
    size.width,
    size.height,
  ).modelScale;
  useFrame((_, dt) => {
    if (!cinemaActive && !reducedMotion && !paused) timeRef.current += Math.min(dt, 0.1);
    const control = journeyRef.current.explorer;
    control.motionOff = cinemaActive ? !cinema || cinema.paused || cinema.reducedMotion : reducedMotion || paused;
    world.current.visible = control.reading !== "skills" && control.reading !== "experience";
    const approaching =
      control.travel?.id === "about" && control.travel.progress > 0.55;
    const target =
      control.reading === "about" || approaching ? informationScale : 1;
    world.current.scale.setScalar(
      reducedMotion
        ? target
        : MathUtils.damp(world.current.scale.x, target, 5, Math.min(dt, 0.1)),
    );
  }, -1);
  return (
    <>
      <ambientLight intensity={isLight ? 0.9 : 0.28} />
      <directionalLight position={[-8.5, 4.5, 5.5]} intensity={3.2} color="#fff1df" />
      <pointLight position={[-4, -1, 3]} intensity={3} color="#7ebfd3" />
      <OpenSpace isLight={isLight} timeRef={timeRef} />
      <Suspense fallback={null}><SceneReflections /></Suspense>
      <Suspense fallback={null}><BlackHole timeRef={timeRef} cinemaActive={cinemaActive} /></Suspense>
      {cinema && <BlackHoleCinema {...cinema} timeRef={timeRef} />}
      <AstronautCamera
        flight={flight}
        reducedMotion={reducedMotion || paused}
        disabled={cinemaActive}
      />
      <FlightDust flight={flight} isLight={isLight} />
      {information && <WorldInformation {...information} isLight={isLight} />}
      <ProjectGallery
        journey={journeyRef}
        timeRef={timeRef}
        selected={project}
        onSelect={onProject}
        isLight={isLight}
      />
      <CareerConstellation
        journey={journeyRef}
        timeRef={timeRef}
        selected={milestone}
        onSelect={onMilestone}
        isLight={isLight}
        reset={skyReset}
      />
      <Suspense fallback={null}>
        <ContactEarth
          journey={journeyRef}
          timeRef={timeRef}
          signal={signal}
          isLight={isLight}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <NeuralSkills
        key={category}
        timeRef={timeRef}
        journey={journeyRef}
        category={category}
        selected={selected}
        onSelect={onSelect}
        pulse={neuralPulse}
        reset={networkReset}
        isLight={isLight}
      />
      <group ref={world} name="tech-universe">
        <EarthWorld timeRef={timeRef} isLight={isLight} />
      </group>
    </>
  );
}

