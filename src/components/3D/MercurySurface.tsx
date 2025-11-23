import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../utils/store';
import { SCENE, RIPPLE } from '../../utils/constants';

// Import shader source
import mercuryVertexShader from '../../shaders/mercuryVertex.glsl?raw';
import mercuryFragmentShader from '../../shaders/mercuryFragment.glsl?raw';

interface MercurySurfaceProps {
  envMap?: THREE.CubeTexture;
}

export function MercurySurface({ envMap }: MercurySurfaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const ripples = useAppStore((state) => state.ripples);
  const addRipple = useAppStore((state) => state.addRipple);
  const settings = useAppStore((state) => state.settings);

  // Create plane geometry with optimized subdivision
  const geometry = useMemo(() => {
    // Aggressively reduced segments to prevent crash
    const segments = settings.performanceMode === 'high' ? 64 :
      settings.performanceMode === 'medium' ? 32 : 16;
    return new THREE.PlaneGeometry(SCENE.mercurySize, SCENE.mercurySize, segments, segments);
  }, [settings.performanceMode]);

  // Create mercury shader material
  const mercuryMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRipples: { value: new Array(10).fill(null).map(() => new THREE.Vector2(0, 0)) },
        uRippleStrengths: { value: new Array(10).fill(0) },
        uRippleTimes: { value: new Array(10).fill(0) },
        uCameraPosition: { value: new THREE.Vector3() },
        uEnvironmentMap: { value: null },
        uEnvMapIntensity: { value: 2.0 },
      },
      vertexShader: mercuryVertexShader,
      fragmentShader: mercuryFragmentShader,
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, []);

  // Handle mouse interaction for ripples
  const handlePointerMove = (event: THREE.Event) => {
    if (!settings.fluidEnabled) return;

    const intersect = event as unknown as { point?: THREE.Vector3 };
    if (intersect.point) {
      // Throttle ripple creation on move
      const now = Date.now();
      const lastRipple = ripples[ripples.length - 1];
      if (!lastRipple || now - lastRipple.time > 100) {
        addRipple([intersect.point.x, intersect.point.z], RIPPLE.hoverStrength);
      }
    }
  };

  const handleClick = (event: THREE.Event) => {
    if (!settings.fluidEnabled) return;

    const intersect = event as unknown as { point?: THREE.Vector3 };
    if (intersect.point) {
      addRipple([intersect.point.x, intersect.point.z], RIPPLE.clickStrength);
    }
  };

  // Update shader uniforms each frame
  useFrame((state) => {
    // Update time and camera
    mercuryMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    mercuryMaterial.uniforms.uCameraPosition.value.copy(camera.position);

    // Update ripple uniforms
    const ripplePositions = mercuryMaterial.uniforms.uRipples.value as THREE.Vector2[];
    const rippleStrengths = mercuryMaterial.uniforms.uRippleStrengths.value as number[];
    const rippleTimes = mercuryMaterial.uniforms.uRippleTimes.value as number[];

    // Reset arrays
    for (let i = 0; i < 10; i++) {
      ripplePositions[i].set(0, 0);
      rippleStrengths[i] = 0;
      rippleTimes[i] = 0;
    }

    const now = Date.now();
    // Optimize: iterate backwards to find active ripples without creating new arrays
    let activeCount = 0;
    for (let i = ripples.length - 1; i >= 0 && activeCount < 10; i--) {
      const ripple = ripples[i];
      if (now - ripple.time < RIPPLE.maxRipples * 1000) {
        ripplePositions[activeCount].set(ripple.position[0], ripple.position[1]);
        rippleStrengths[activeCount] = ripple.strength;
        rippleTimes[activeCount] = ripple.time / 1000;
        activeCount++;
      }
    }

    if (envMap) {
      mercuryMaterial.uniforms.uEnvironmentMap.value = envMap;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, SCENE.mercuryPosition, 0]}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      geometry={geometry}
      material={mercuryMaterial}
    />
  );
}

