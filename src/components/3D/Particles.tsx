import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../utils/store';

interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 100 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const settings = useAppStore((state) => state.settings);

  // Don't render particles in low performance mode - reduced counts for stability
  const actualCount = settings.performanceMode === 'high' ? Math.floor(count / 2) :
    settings.performanceMode === 'medium' ? Math.floor(count / 4) : 0;


  // Generate particle positions and velocities
  const { positions, velocities, sizes, initialPositions } = useMemo(() => {
    const positions = new Float32Array(actualCount * 3);
    const velocities = new Float32Array(actualCount * 3);
    const sizes = new Float32Array(actualCount);
    const initialPositions = new Float32Array(actualCount * 3);

    for (let i = 0; i < actualCount; i++) {
      const i3 = i * 3;

      // Random position around the mercury surface
      const theta = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = -0.5 + Math.random() * 3;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      initialPositions[i3] = x;
      initialPositions[i3 + 1] = y;
      initialPositions[i3 + 2] = z;

      // Random velocity (very slow upward drift)
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = Math.random() * 0.02 + 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Random sizes
      sizes[i] = Math.random() * 0.05 + 0.02;
    }

    return { positions, velocities, sizes, initialPositions };
  }, [actualCount]);

  // Custom shader material for particles
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#c0c0c0') },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          vec3 pos = position;

          // Add subtle floating motion
          pos.x += sin(uTime * 0.5 + position.z * 2.0) * 0.1;
          pos.y += sin(uTime * 0.3 + position.x * 2.0) * 0.05;
          pos.z += cos(uTime * 0.4 + position.y * 2.0) * 0.1;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          // Size attenuation
          gl_PointSize = size * (300.0 / -mvPosition.z);

          // Fade based on height
          vAlpha = smoothstep(-0.5, 3.0, pos.y) * (1.0 - smoothstep(2.0, 4.0, pos.y));

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          // Circular particle
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;

          // Soft edge
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha;

          // Metallic color
          vec3 color = uColor + vec3(0.2) * (1.0 - dist * 2.0);

          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || actualCount === 0) return;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;

    // Update particle positions
    for (let i = 0; i < actualCount; i++) {
      const i3 = i * 3;

      // Move particles upward slowly
      positions[i3 + 1] += velocities[i3 + 1];

      // Reset particles that go too high
      if (positions[i3 + 1] > 4) {
        positions[i3] = initialPositions[i3] + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = -0.5 + Math.random() * 0.5;
        positions[i3 + 2] = initialPositions[i3 + 2] + (Math.random() - 0.5) * 2;
      }
    }

    positionAttribute.needsUpdate = true;

    // Update shader time
    particleMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (actualCount === 0) return null;

  // Create buffer attributes
  const positionBuffer = useMemo(() => {
    return new THREE.BufferAttribute(positions, 3);
  }, [positions]);

  const sizeBuffer = useMemo(() => {
    return new THREE.BufferAttribute(sizes, 1);
  }, [sizes]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <primitive object={positionBuffer} attach="attributes-position" />
        <primitive object={sizeBuffer} attach="attributes-size" />
      </bufferGeometry>
      <primitive object={particleMaterial} attach="material" />
    </points>
  );
}
