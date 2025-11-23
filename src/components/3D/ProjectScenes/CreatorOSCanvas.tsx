import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface CreatorOSCanvasProps {
    color: string;
    stage: number;
}

/**
 * Immersive 3D scene for CreatorOS project
 * Shows: 3D bar chart, heart rate line with particles, rotating trophy
 */
export function CreatorOSCanvas({ color, stage }: CreatorOSCanvasProps) {
    return (
        <div style={{ width: '100%', height: '350px', position: 'relative' }}>
            <Canvas
                camera={{ position: [0, 1.5, 6], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.2} color={color} />
                <pointLight position={[-10, 5, -10]} intensity={0.6} color="#8B5CF6" />

                {/* 3D Bar Chart */}
                <BarChart color={color} stage={stage} />

                {/* Heart Rate Line */}
                <HeartRateLine color={color} stage={stage} />

                {/* Rotating Trophy */}
                {stage >= 2 && <Trophy color={color} />}

                {/* Data Nodes */}
                {stage >= 1 && <DataNodes color={color} />}
            </Canvas>

            {/* Overlay stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    color: color,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    textShadow: `0 0 10px ${color}40`,
                }}
            >
                <div>7.5x ROAS</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Performance Increase</div>
            </motion.div>
        </div>
    );
}

/**
 * Animated 3D bar chart
 */
function BarChart({ color, stage }: { color: string; stage: number }) {
    const barsRef = useRef<THREE.Group>(null);
    const barHeights = [0.6, 1.2, 0.9, 1.6, 1.4];

    useFrame((state) => {
        if (!barsRef.current) return;

        // Gentle floating
        barsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;

        // Individual bar animations
        barsRef.current.children.forEach((bar, i) => {
            const mesh = bar as THREE.Mesh;
            const targetScale = stage >= 1 ? barHeights[i] : 0.1;
            mesh.scale.y += (targetScale - mesh.scale.y) * 0.05;
        });
    });

    return (
        <group ref={barsRef} position={[-2.5, -1, 0]}>
            {barHeights.map((height, i) => (
                <mesh key={i} position={[i * 0.5, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.25, 1, 0.25]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.4}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Heart rate line with glowing particles
 */
function HeartRateLine({ color, stage }: { color: string; stage: number }) {
    const particlesRef = useRef<THREE.Points>(null);
    const lineRef = useRef<THREE.Line>(null);
    const numPoints = 100;

    useFrame((state) => {
        if (!particlesRef.current || !lineRef.current) return;

        const time = state.clock.elapsedTime;
        const positions = particlesRef.current.geometry.attributes.position;
        const linePositions = lineRef.current.geometry.attributes.position;

        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * 5 - 2.5;
            // Heart rate pattern: combination of sine waves
            const y =
                Math.sin(x * 3 + time * 2) * 0.25 +
                Math.sin(x * 7 + time * 4) * 0.1 +
                0.5;
            const z = -0.5;

            positions.setXYZ(i, x, y, z);
            linePositions.setXYZ(i, x, y, z);
        }

        positions.needsUpdate = true;
        linePositions.needsUpdate = true;

        // Fade based on stage
        const material = particlesRef.current.material as THREE.PointsMaterial;
        material.opacity = stage >= 1 ? 0.9 : 0;
    });

    const positions = new Float32Array(numPoints * 3);
    const linePositions = new Float32Array(numPoints * 3);

    return (
        <group position={[0, 0.5, 0]}>
            {/* Particle trail */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={numPoints}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08}
                    color={color}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                />
            </points>

            {/* Connecting line */}
            <line ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={numPoints}
                        array={linePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={color} transparent opacity={0.3} linewidth={2} />
            </line>
        </group>
    );
}

/**
 * Rotating trophy
 */
function Trophy({ color }: { color: string }) {
    const trophyRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!trophyRef.current) return;

        trophyRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        trophyRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    });

    return (
        <group ref={trophyRef} position={[2, 0, 0]}>
            {/* Cup */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFB000"
                    emissiveIntensity={0.5}
                    roughness={0.1}
                    metalness={0.9}
                />
            </mesh>

            {/* Handles */}
            {[-1, 1].map((side) => (
                <mesh key={side} position={[side * 0.35, 0.5, 0]} rotation={[0, 0, side * Math.PI / 4]}>
                    <torusGeometry args={[0.15, 0.03, 8, 16]} />
                    <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
                </mesh>
            ))}

            {/* Base */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.2, 16]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Glow */}
            <pointLight position={[0, 0.5, 0]} intensity={0.8} color={color} distance={2} />
        </group>
    );
}

/**
 * Floating data nodes with connections
 */
function DataNodes({ color }: { color: string }) {
    const nodesRef = useRef<THREE.Group>(null);
    const nodePositions = [
        [-1.5, 1.2, -0.8],
        [0, 1.5, -1],
        [1.5, 1.3, -0.9],
    ];

    useFrame((state) => {
        if (!nodesRef.current) return;

        nodesRef.current.children.forEach((node, i) => {
            const phase = (i / 3) * Math.PI * 2;
            node.position.y = nodePositions[i][1] + Math.sin(state.clock.elapsedTime + phase) * 0.1;
        });
    });

    return (
        <group ref={nodesRef}>
            {nodePositions.map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} castShadow>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.6}
                        roughness={0.3}
                        metalness={0.6}
                    />
                </mesh>
            ))}

            {/* Connecting lines */}
            {[0, 1].map((i) => {
                const start = nodePositions[i];
                const end = nodePositions[i + 1];
                const midX = (start[0] + end[0]) / 2;
                const midY = (start[1] + end[1]) / 2;
                const midZ = (start[2] + end[2]) / 2;

                return (
                    <line key={i}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={2}
                                array={new Float32Array([...start, ...end])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial color={color} transparent opacity={0.3} />
                    </line>
                );
            })}
        </group>
    );
}
