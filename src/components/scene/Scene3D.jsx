/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Stars, Environment } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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

/* ---------- Central icosahedron — the "core" object ---------- */

const tmpColor = new THREE.Color();

function CoreObject({ scrollRef, mouseRef }) {
    const meshRef = useRef();
    const matRef = useRef();
    const groupRef = useRef();
    const targetRot = useRef({ x: 0, y: 0 });

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const p = scrollRef.current; // 0..1
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };

        if (groupRef.current) {
            // Drift down + rotate a bit as user scrolls
            groupRef.current.position.y = -p * 4.5;
            groupRef.current.position.x = Math.sin(p * Math.PI * 2) * 1.6 + m.nx * 0.3;
            groupRef.current.rotation.z = p * Math.PI * 0.6;
        }

        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.15;
            meshRef.current.rotation.y += delta * 0.20;
            // Mouse-driven tilt offset (added on top of base rotation)
            targetRot.current.x += (m.ny * 0.45 - targetRot.current.x) * 0.05;
            targetRot.current.y += (m.nx * 0.45 - targetRot.current.y) * 0.05;
            meshRef.current.rotation.x += targetRot.current.x * 0.02;
            meshRef.current.rotation.y += targetRot.current.y * 0.02;

            const breathe = 1 + Math.sin(t * 0.6) * 0.04;
            const scaleByScroll = 1 + Math.sin(p * Math.PI) * 0.25;
            meshRef.current.scale.setScalar(breathe * scaleByScroll);
        }

        if (matRef.current) {
            // Distortion peaks mid-scroll, calms at start/end
            matRef.current.distort = 0.25 + Math.sin(p * Math.PI) * 0.45;
            matRef.current.speed = 1.5 + p * 2.5;

            // Hue sweeps cyan → violet → magenta → cyan
            const hue = (0.5 + p * 0.55) % 1;
            tmpColor.setHSL(hue, 0.7, 0.55);
            matRef.current.color.copy(tmpColor);
            matRef.current.emissive.copy(tmpColor).multiplyScalar(0.25);
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[0.65, 3]} />
                    <MeshDistortMaterial
                        ref={matRef}
                        color="#22d3ee"
                        emissive="#22d3ee"
                        emissiveIntensity={0.2}
                        roughness={0.18}
                        metalness={0.85}
                        distort={0.3}
                        speed={2}
                    />
                </mesh>
            </Float>
        </group>
    );
}

/* ---------- Orbiting shards — one per section ---------- */

const SHARDS = [
    { angle: 0,            color: '#22d3ee' }, // about
    { angle: Math.PI * 0.5, color: '#a78bfa' }, // skills
    { angle: Math.PI,      color: '#f472b6' }, // projects
    { angle: Math.PI * 1.5, color: '#facc15' }, // contact
];

function Shards({ scrollRef }) {
    const groupRef = useRef();
    const shardRefs = useRef([]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const p = scrollRef.current;

        if (groupRef.current) {
            // Shards orbit faster as you scroll deeper
            groupRef.current.rotation.y = t * (0.15 + p * 0.4);
            groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
            groupRef.current.position.y = -p * 4.5;
            groupRef.current.position.x = Math.sin(p * Math.PI * 2) * 1.6;
        }

        // Highlight the shard that maps to the current section (4 sections)
        const activeIndex = Math.min(SHARDS.length - 1, Math.floor(p * SHARDS.length + 0.001));
        shardRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const target = i === activeIndex ? 1.4 : 0.9;
            mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.06);
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.015;
        });
    });

    const radius = 4.5;

    return (
        <group ref={groupRef}>
            {SHARDS.map((s, i) => (
                <mesh
                    key={i}
                    ref={(el) => (shardRefs.current[i] = el)}
                    position={[Math.cos(s.angle) * radius, Math.sin(s.angle) * radius * 0.55, -1]}
                >
                    <octahedronGeometry args={[0.14, 0]} />
                    <meshStandardMaterial
                        color={s.color}
                        emissive={s.color}
                        emissiveIntensity={0.55}
                        roughness={0.2}
                        metalness={0.7}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ---------- Camera scroll dolly ---------- */

function CameraRig({ scrollRef, mouseRef }) {
    useFrame((state) => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        // Pull camera back so the scene reads as ambient, not foreground
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
                <CoreObject scrollRef={scrollRef} mouseRef={mouseRef} />
                <Shards scrollRef={scrollRef} />

                <Sparkles count={140} scale={[16, 16, 10]} size={2.4} speed={0.35} color="#22d3ee" opacity={0.6} />
                <Stars radius={50} depth={40} count={1200} factor={3} saturation={0} fade speed={0.4} />

                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default Scene3D;
