/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Stars, Environment, Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FaReact, FaPython, FaAws, FaNodeJs } from 'react-icons/fa';
import {
    SiPytorch,
    SiTensorflow,
    SiDocker,
    SiOpenai,
    SiAnthropic,
    SiLangchain,
    SiMongodb,
    SiRedis,
    SiNextdotjs,
    SiTypescript,
} from 'react-icons/si';
import './Scene3D.css';

/* Scroll progress in [0..1] without re-rendering React on every scroll. */
const useScrollProgressRef = () => {
    const ref = useRef(0);
    useEffect(() => {
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            ref.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);
    return ref;
};

/* ---------- Central icosahedron the "core" object ---------- */

const tmpColor = new THREE.Color();

/* The core sits at the origin of its parent group (no position drift here).
   It only manages its own rotation, scale-breathe, mouse tilt, and material
   colour cycling. Position drift is owned by <CoreSystem> below.
   `meshRef` is a ref forwarded from the parent so the icon Htmls can use the
   same mesh as their occlusion target gives "planet behind sun" effect. */
function CoreObject({ scrollRef, mouseRef, meshRef }) {
    const matRef = useRef();
    const targetRot = useRef({ x: 0, y: 0 });

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };

        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.15;
            meshRef.current.rotation.y += delta * 0.20;
            targetRot.current.x += (m.ny * 0.45 - targetRot.current.x) * 0.05;
            targetRot.current.y += (m.nx * 0.45 - targetRot.current.y) * 0.05;
            meshRef.current.rotation.x += targetRot.current.x * 0.02;
            meshRef.current.rotation.y += targetRot.current.y * 0.02;

            const breathe = 1 + Math.sin(t * 0.6) * 0.04;
            const scaleByScroll = 1 + Math.sin(p * Math.PI) * 0.25;
            meshRef.current.scale.setScalar(breathe * scaleByScroll);
        }

        if (matRef.current) {
            matRef.current.distort = 0.25 + Math.sin(p * Math.PI) * 0.45;
            matRef.current.speed = 1.5 + p * 2.5;
            const hue = (0.5 + p * 0.55) % 1;
            tmpColor.setHSL(hue, 0.7, 0.55);
            matRef.current.color.copy(tmpColor);
            matRef.current.emissive.copy(tmpColor).multiplyScalar(0.25);
        }
    });

    return (
        <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[0.55, 3]} />
                <MeshDistortMaterial
                    ref={matRef}
                    color="#22d3ee"
                    emissive="#22d3ee"
                    emissiveIntensity={0.18}
                    roughness={0.18}
                    metalness={0.85}
                    distort={0.3}
                    speed={2}
                    transparent
                    opacity={0.9}
                />
            </mesh>
        </Float>
    );
}

/* ---------- Floating tech icons ring around the central core ---------- */

const TECH_ICONS = [
    { Icon: FaPython,     color: '#ffce3e' },
    { Icon: SiTensorflow, color: '#ff6f00' },
    { Icon: SiPytorch,    color: '#ee4c2c' },
    { Icon: FaReact,      color: '#61dafb' },
    { Icon: SiDocker,     color: '#2496ed' },
    { Icon: SiOpenai,     color: '#10a37f' },
    { Icon: SiAnthropic,  color: '#cc785c' },
    { Icon: SiLangchain,  color: '#22d3ee' },
    { Icon: SiMongodb,    color: '#4faa41' },
    { Icon: SiRedis,      color: '#dc382d' },
    { Icon: FaNodeJs,     color: '#5fa04e' },
    { Icon: SiNextdotjs,  color: '#cbd5e1' },
    { Icon: FaAws,        color: '#ff9900' },
    { Icon: SiTypescript, color: '#3178c6' },
];

function TechIcon({ Icon, color, basePos, phase, occludeRef }) {
    const groupRef = useRef();
    const [occluded, setOccluded] = useState(false);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (!groupRef.current) return;
        // Gentle local bob around base position so the ring doesn't feel rigid
        const r = 0.18;
        const lx = Math.cos(t * 0.35 + phase) * r;
        const ly = Math.sin(t * 0.35 + phase * 1.3) * r * 0.7;
        groupRef.current.position.set(
            basePos[0] + lx,
            basePos[1] + ly,
            basePos[2],
        );
    });

    /* `occlude` accepts an array of refs to test against. drei raycasts from
       the camera through the html's world position; if the ray hits one of
       these meshes first, `onOcclude(true)` fires and we fade the icon out. */
    const occludeTargets = occludeRef ? [occludeRef] : undefined;

    return (
        <group ref={groupRef}>
            <Html
                center
                distanceFactor={8}
                zIndexRange={[0, 0]}
                occlude={occludeTargets}
                onOcclude={setOccluded}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
                <div
                    className={`tech-icon-3d ${occluded ? 'is-occluded' : ''}`}
                    style={{ color }}
                >
                    <Icon />
                </div>
            </Html>
        </group>
    );
}

/* Pre-compute icon base positions on a tilted, staggered 3D ring around (0,0,0)
   the same origin as the central core, so the core sits in its centre. */
const ICON_POSITIONS = TECH_ICONS.map((_, i) => {
    const angle = (i / TECH_ICONS.length) * Math.PI * 2;
    // Alternate radii so icons don't sit on a perfect circle
    const radius = i % 2 === 0 ? 5.2 : 4.6;
    // Vertical stagger using a low-frequency sinusoid keyed on index
    const yStagger = Math.sin(i * 1.7) * 1.4;
    // Tilted ring: Z component is half of the cos of angle so the ring leans
    // toward the camera on one side and away on the other → 3D feel
    return [
        Math.cos(angle) * radius,
        yStagger,
        Math.sin(angle) * radius * 0.45 - 1,
    ];
});

/* Just the rotating ring, around its own origin (0,0,0). No position drift —
   that's the parent <CoreSystem>'s job, so the ring shares an origin with the
   core. `occludeRef` is the core mesh passed to each icon so it hides when
   its orbital position is behind the core (planets behind sun). */
function TechIcons({ scrollRef, occludeRef }) {
    const groupRef = useRef();
    const speedRef = useRef(0);
    const lastProgressRef = useRef(0);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const p = scrollRef.current;
        if (!groupRef.current) return;

        /* Slow → speed → slow ramp: rotation tracks scroll velocity, lerps. */
        const dp = p - lastProgressRef.current;
        lastProgressRef.current = p;
        const velocity = Math.abs(dp / Math.max(0.001, delta));
        const baseSpeed = 0.018;
        const boost = Math.min(velocity * 0.35, 0.05);
        const target = baseSpeed + boost;
        speedRef.current += (target - speedRef.current) * 0.04;

        groupRef.current.rotation.y += speedRef.current * delta * 60;
        groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.06;
    });

    return (
        <group ref={groupRef}>
            {TECH_ICONS.map((item, i) => (
                <TechIcon
                    key={i}
                    Icon={item.Icon}
                    color={item.color}
                    basePos={ICON_POSITIONS[i]}
                    phase={i * 0.7}
                    occludeRef={occludeRef}
                />
            ))}
        </group>
    );
}

/* Single parent group that drifts both the core and the ring together with
   scroll. The core mesh ref is shared so each icon's <Html> can occlude
   against it giving the "planet behind sun" effect. */
function CoreSystem({ scrollRef, mouseRef }) {
    const groupRef = useRef();
    const coreMeshRef = useRef();

    useFrame(() => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        if (!groupRef.current) return;
        groupRef.current.position.y = -p * 4.5;
        groupRef.current.position.x = Math.sin(p * Math.PI * 2) * 1.5 + m.nx * 0.2;
    });

    return (
        <group ref={groupRef}>
            <CoreObject
                scrollRef={scrollRef}
                mouseRef={mouseRef}
                meshRef={coreMeshRef}
            />
            <TechIcons scrollRef={scrollRef} occludeRef={coreMeshRef} />
        </group>
    );
}

/* ---------- Camera scroll dolly ---------- */

function CameraRig({ scrollRef, mouseRef }) {
    useFrame((state) => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        const targetZ = 9 - p * 1.2;
        const targetY = -p * 0.8 + m.ny * 0.3;
        const targetX = m.nx * 0.5;
        state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
        state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
        state.camera.position.z += (targetZ - state.camera.position.z) * 0.06;
        state.camera.lookAt(0, -p * 4.5, 0);
    });
    return null;
}

/* ---------- Scene root ---------- */

const Scene3D = ({ mouseRef }) => {
    const scrollRef = useScrollProgressRef();

    return (
        <div className="scene-3d" aria-hidden="true">
            <Canvas
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                camera={{ position: [0, 0, 9], fov: 50 }}
            >
                <color attach="background" args={['#070b16']} />

                <ambientLight intensity={0.35} />
                <pointLight position={[6, 6, 6]} intensity={0.9} color="#22d3ee" />
                <pointLight position={[-6, -4, -3]} intensity={0.7} color="#a78bfa" />
                <pointLight position={[0, 5, -5]} intensity={0.4} color="#f472b6" />

                <CameraRig scrollRef={scrollRef} mouseRef={mouseRef} />
                <CoreSystem scrollRef={scrollRef} mouseRef={mouseRef} />

                <Sparkles count={140} scale={[16, 16, 10]} size={2.4} speed={0.35} color="#22d3ee" opacity={0.6} />
                <Stars radius={50} depth={40} count={1200} factor={3} saturation={0} fade speed={0.4} />

                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default Scene3D;
