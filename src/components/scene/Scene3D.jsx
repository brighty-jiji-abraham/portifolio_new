/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Sparkles, Stars, Environment, useTexture } from '@react-three/drei';
import React, { useCallback, useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { updateDrone } from '../../hooks/useSoundscape';
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

/* Detect theme changes */
const useTheme = () => {
    const [theme, setTheme] = useState(
        typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'dark' : 'dark'
    );
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);
    return theme;
};

/* Scroll progress in [0..1] */
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

/* ---------- Digital Dot Earth ---------- */

/* ---------- Procedural Cracked Magma Planet ---------- */

const MagmaPlanet = ({ isLight, meshRef }) => {
    const materialRef = useRef();

    // Procedural 3D Simplex noise for cracks
    const vertexShader = `
        varying vec2 vUv;
        varying float vNoise;
        varying vec3 vNormal;
        uniform float uTime;

        // Simplex 3D Noise 
        // by Ian McEwan, Ashima Arts
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 1.0/7.0; 
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            vUv = uv;
            vNormal = normal;

            // Generate cracks using absolute noise (ridges)
            float n1 = abs(snoise(position * 2.0 + uTime * 0.05));
            float n2 = abs(snoise(position * 4.0 - uTime * 0.03));
            
            // The noise value (close to 0 = deep crack, large value = crust)
            vNoise = smoothstep(0.0, 0.4, n1 * 0.6 + n2 * 0.4);
            
            // Displace vertices inwards for cracks
            float displacement = mix(-0.08, 0.0, vNoise);
            vec3 newPosition = position + normal * displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 uCrustColor;
        uniform vec3 uMagmaCore;
        uniform vec3 uMagmaEdge;
        uniform float uTime;
        
        varying vec2 vUv;
        varying float vNoise;
        varying vec3 vNormal;

        void main() {
            // Light vector for basic shading on the crust
            vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
            float diff = max(dot(vNormal, lightDir), 0.0);
            
            // The magma color (hotter in the deep center of the crack)
            vec3 magmaColor = mix(uMagmaCore, uMagmaEdge, vNoise * 4.0);
            
            // The crust color
            vec3 shadedCrust = uCrustColor * (0.4 + 0.6 * diff);
            
            // Mix between magma and crust based on the noise threshold
            // Add some pulsing glow to the magma
            float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
            float magmaIntensity = smoothstep(0.3, 0.0, vNoise) * (0.8 + 0.2 * pulse);
            
            vec3 finalColor = mix(magmaColor * magmaIntensity, shadedCrust, smoothstep(0.1, 0.2, vNoise));

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const uniforms = useMemo(() => {
        // Base crust color depends on light mode (pale blue/gray vs dark)
        const crustColor = isLight ? new THREE.Color('#d0d8e0') : new THREE.Color('#1a2636');
        return {
            uCrustColor: { value: crustColor },
            uMagmaCore: { value: new THREE.Color('#ffdd44') }, // Yellow hot core
            uMagmaEdge: { value: new THREE.Color('#ff2200') }, // Fiery orange edge
            uTime: { value: 0 }
        };
    }, [isLight]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* High poly count needed for vertex displacement */}
            <sphereGeometry args={[1.56, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

function DigitalEarth({ scrollRef, mouseRef, meshRef, isLight }) {
    const groupRef = useRef();

    useFrame((state, delta) => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.08;
            groupRef.current.rotation.x += delta * 0.02;
            groupRef.current.rotation.x += (m.ny * 0.15 - groupRef.current.rotation.x) * 0.05;
            groupRef.current.rotation.y += (m.nx * 0.15) * 0.05;
        }
        if (meshRef.current) {
             meshRef.current.rotation.y = groupRef.current.rotation.y;
             meshRef.current.rotation.x = groupRef.current.rotation.x;
        }
    });

    return (
        <group ref={groupRef}>
            {/* The animated Cracked Magma Planet */}
            <MagmaPlanet isLight={isLight} meshRef={meshRef} />
        </group>
    );
}

/* ---------- Orbiting Tech Satellites ---------- */

const TECH_ICONS = [
    { Icon: FaPython,     color: '#ffce3e' },
    { Icon: SiTensorflow, color: '#ff6f00' },
    { Icon: SiPytorch,    color: '#ee4c2c' },
    { Icon: FaReact,      color: '#61dafb', lightColor: '#00d8ff' },
    { Icon: SiDocker,     color: '#2496ed' },
    { Icon: SiOpenai,     color: '#10a37f' },
    { Icon: SiAnthropic,  color: '#cc785c' },
    { Icon: SiLangchain,  color: '#00f7ff', lightColor: '#0099aa' },
    { Icon: SiMongodb,    color: '#4faa41' },
    { Icon: SiRedis,      color: '#dc382d' },
    { Icon: FaNodeJs,     color: '#5fa04e' },
    { Icon: SiNextdotjs,  color: '#ffffff', lightColor: '#000000' },
    { Icon: FaAws,        color: '#ff9900' },
    { Icon: SiTypescript, color: '#3178c6' },
];

const useSvgTexture = (Icon, color) => {
    return useMemo(() => {
        let svgString = renderToString(<Icon />);
        svgString = svgString.replace(/currentColor/g, color);
        svgString = svgString.replace(/width="1em"/, 'width="256"').replace(/height="1em"/, 'height="256"');
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const texture = new THREE.TextureLoader().load(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        return texture;
    }, [Icon, color]);
};

function TechIconSatellite({ Icon, color, lightColor, index, isLight }) {
    const orbitGroup = useRef();
    const iconGroup = useRef();
    const trailRef = useRef();
    
    const displayColor = isLight ? (lightColor || color) : color;
    const texture = useSvgTexture(Icon, displayColor);

    const [orbitParams] = useState(() => {
        const isPolar = index % 3 === 0;
        const angleX = isPolar ? (Math.random() * 0.5 + 1.0) : (Math.random() - 0.5) * 0.5;
        const angleY = (Math.random() - 0.5) * Math.PI * 2;
        const angleZ = (Math.random() - 0.5) * Math.PI * 2;
        
        const radius = 2.0 + Math.random() * 1.5;
        const speed = (0.15 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
        const startPhase = Math.random() * Math.PI * 2;
        
        const ringOpacity = Math.random() > 0.6 ? 0.3 : 0.08;
        return { angleX, angleY, angleZ, radius, speed, startPhase, ringOpacity };
    });

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (orbitGroup.current) {
            orbitGroup.current.rotation.x = orbitParams.angleX;
            orbitGroup.current.rotation.y = orbitParams.angleY;
            orbitGroup.current.rotation.z = orbitParams.angleZ;
            
            const currentAngle = orbitParams.startPhase + t * orbitParams.speed;
            iconGroup.current.position.x = Math.cos(currentAngle) * orbitParams.radius;
            iconGroup.current.position.y = Math.sin(currentAngle) * orbitParams.radius;
            
            if (trailRef.current) {
                trailRef.current.rotation.z = currentAngle;
            }
        }
    });

    const ringGeometry = useMemo(() => new THREE.RingGeometry(orbitParams.radius - 0.005, orbitParams.radius + 0.005, 64), [orbitParams.radius]);
    const trailGeometry = useMemo(() => new THREE.RingGeometry(orbitParams.radius - 0.015, orbitParams.radius + 0.015, 32, 1, 0, Math.PI / 4), [orbitParams.radius]);
    
    const blendingMode = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

    return (
        <group ref={orbitGroup}>
            <mesh geometry={ringGeometry}>
                <meshBasicMaterial color={displayColor} transparent opacity={isLight ? orbitParams.ringOpacity * 1.5 : orbitParams.ringOpacity} side={THREE.DoubleSide} blending={blendingMode} />
            </mesh>

            <mesh geometry={trailGeometry} ref={trailRef}>
                <meshBasicMaterial color={displayColor} transparent opacity={0.6} side={THREE.DoubleSide} blending={blendingMode} />
            </mesh>

            <group ref={iconGroup}>
                <sprite scale={[0.45, 0.45, 0.45]}>
                    <spriteMaterial 
                        map={texture} 
                        transparent={true} 
                        depthTest={true} 
                        blending={blendingMode}
                    />
                </sprite>
            </group>
        </group>
    );
}

function TechSatellites({ isLight }) {
    return (
        <group>
            {TECH_ICONS.map((item, i) => (
                <TechIconSatellite
                    key={i}
                    Icon={item.Icon}
                    color={item.color}
                    lightColor={item.lightColor}
                    index={i}
                    isLight={isLight}
                />
            ))}
        </group>
    );
}

/* ---------- Core System ---------- */
function CoreSystem({ scrollRef, mouseRef, isLight }) {
    const groupRef = useRef();
    const coreMeshRef = useRef();

    useFrame(() => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        if (!groupRef.current) return;
        
        groupRef.current.position.y = -p * 4.0;
        groupRef.current.position.x = Math.sin(p * Math.PI) * 1.5 + m.nx * 0.1;
    });

    return (
        <group ref={groupRef}>
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
                <DigitalEarth scrollRef={scrollRef} mouseRef={mouseRef} meshRef={coreMeshRef} isLight={isLight} />
                <TechSatellites isLight={isLight} />
            </Float>
        </group>
    );
}

/* ---------- Camera scroll dolly ---------- */
const cameraWaypoints = [
    { p: 0.00, offset: new THREE.Vector3(0, 0, 9.5) },        // Hero
    { p: 0.25, offset: new THREE.Vector3(3.5, 0, 4.5) },      // About: Zoomed into right side
    { p: 0.50, offset: new THREE.Vector3(-4.5, 1, -3.5) },    // Experience: Orbiting the dark side
    { p: 0.75, offset: new THREE.Vector3(0, 5, 2) },          // Projects: Top down overview
    { p: 1.00, offset: new THREE.Vector3(0, 0, 9.5) }         // Contact: Back to wide shot
];

function getInterpolated(p, array, key) {
    for (let i = 0; i < array.length - 1; i++) {
        if (p >= array[i].p && p <= array[i + 1].p) {
            const t = (p - array[i].p) / (array[i + 1].p - array[i].p);
            // Smoothstep for cinematic ease
            const smoothT = t * t * (3 - 2 * t);
            return array[i][key].clone().lerp(array[i + 1][key], smoothT);
        }
    }
    if (p <= array[0].p) return array[0][key].clone();
    return array[array.length - 1][key].clone();
}

function CameraRig({ scrollRef, mouseRef }) {
    const targetPos = useMemo(() => new THREE.Vector3(), []);
    const lookAtPos = useMemo(() => new THREE.Vector3(), []);

    useFrame((state) => {
        const p = scrollRef.current;
        const m = mouseRef ? mouseRef.current : { nx: 0, ny: 0 };
        
        // Base planet position coordinates
        const basePlanetY = -p * 4.0;
        const basePlanetX = Math.sin(p * Math.PI) * 1.5;

        const isMobile = window.innerWidth < 768;
        const mobileScaleX = isMobile ? 0.4 : 1.0;

        // Calculate offset along the spline
        const offset = getInterpolated(p, cameraWaypoints, 'offset');
        
        // Final target position incorporates mouse and planet movement
        targetPos.copy(offset);
        targetPos.x *= mobileScaleX;
        if (isMobile) targetPos.z += 3.0; // Pull back further on mobile

        targetPos.y += basePlanetY + m.ny * 0.3;
        targetPos.x += basePlanetX + m.nx * 0.5;

        updateDrone(p);

        // Smoothly interpolate the camera position for weight
        state.camera.position.lerp(targetPos, 0.025);
        
        // Always look smoothly at the planet's center
        lookAtPos.set(basePlanetX + m.nx * 0.1, basePlanetY + m.ny * 0.1, 0);
        state.camera.lookAt(lookAtPos);
    });
    return null;
}

/* ---------- Error boundary for WebGL failures ---------- */
class WebGLErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(err) {
        console.warn('[Scene3D] WebGL error caught by boundary:', err.message);
    }
    render() {
        if (this.state.hasError) {
            return <div className="scene-3d" aria-hidden="true" style={{ background: 'var(--bg-0)' }} />;
        }
        return this.props.children;
    }
}

/* ---------- Scene root ---------- */
const Scene3D = ({ mouseRef }) => {
    const scrollRef = useScrollProgressRef();
    const theme = useTheme();
    const isLight = theme === 'light';
    const [canvasKey, setCanvasKey] = useState(0);
    const [contextLost, setContextLost] = useState(false);

    const handleCreated = useCallback((state) => {
        const canvas = state.gl.domElement;
        const onLost = (e) => {
            e.preventDefault();
            setContextLost(true);
        };
        const onRestored = () => {
            setContextLost(false);
        };
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
    }, []);

    useEffect(() => {
        if (!contextLost) return;
        const timer = setTimeout(() => {
            setCanvasKey((k) => k + 1);
            setContextLost(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [contextLost]);

    return (
        <WebGLErrorBoundary>
            <div className="scene-3d" aria-hidden="true">
                <Canvas
                    key={canvasKey}
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    camera={{ position: [0, 0, 9.5], fov: 50 }}
                    onCreated={handleCreated}
                >
                    <ambientLight intensity={isLight ? 0.6 : 0.2} />
                    <pointLight position={[6, 6, 6]} intensity={isLight ? 0.8 : 1.5} color={isLight ? '#C08552' : '#22d3ee'} />
                    <pointLight position={[-6, -4, -3]} intensity={0.5} color={isLight ? '#8C5A3C' : '#87CEFA'} />

                    <CameraRig scrollRef={scrollRef} mouseRef={mouseRef} />
                    <CoreSystem scrollRef={scrollRef} mouseRef={mouseRef} isLight={isLight} />

                    <Sparkles 
                        count={150} 
                        scale={[18, 18, 12]} 
                        size={isLight ? 3 : 2} 
                        speed={0.4} 
                        color={isLight ? '#C08552' : '#00f7ff'} 
                        opacity={isLight ? 0.8 : 0.4} 
                    />
                    <Stars 
                        radius={60} 
                        depth={40} 
                        count={2000} 
                        factor={isLight ? 5 : 4} 
                        saturation={0} 
                        fade 
                        speed={0.5} 
                    />
                </Canvas>
            </div>
        </WebGLErrorBoundary>
    );
};

export default Scene3D;
