import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../utils/store';
import { SCENE, GLASS_MATERIAL, SPRING_CONFIGS } from '../../utils/constants';
import { Spring3D } from '../../utils/animations';

// Import shader source
import glassVertexShader from '../../shaders/glassVertex.glsl?raw';
import glassFragmentShader from '../../shaders/glassFragment.glsl?raw';

interface GlassHeadProps {
  envMap?: THREE.CubeTexture;
}

export function GlassHead({ envMap }: GlassHeadProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer, size } = useThree();

  const headDropped = useAppStore((state) => state.headDropped);
  const setHeadDropped = useAppStore((state) => state.setHeadDropped);
  const addRipple = useAppStore((state) => state.addRipple);
  const settings = useAppStore((state) => state.settings);

  // Animation state
  const [dropProgress, setDropProgress] = useState(0);
  const [impactOccurred, setImpactOccurred] = useState(false);

  // Spring for cursor following rotation
  const rotationSpringRef = useRef(new Spring3D([0, 0, 0], SPRING_CONFIGS.smooth));

  // Create sphere geometry for head - reduced for stability
  const geometry = useMemo(() => {
    const segments = settings.performanceMode === 'high' ? 64 :
      settings.performanceMode === 'medium' ? 32 : 16;
    return new THREE.SphereGeometry(SCENE.headRadius, segments, segments);
  }, [settings.performanceMode]);

  // Create glass shader material
  const glassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIOR: { value: GLASS_MATERIAL.ior },
        uTransmission: { value: GLASS_MATERIAL.transmission },
        uThickness: { value: GLASS_MATERIAL.thickness },
        uChromaticAberration: { value: GLASS_MATERIAL.chromaticAberration },
        uTintColor: { value: new THREE.Vector3(...GLASS_MATERIAL.tintColor) },
        uEnvironmentMap: { value: null },
        uEnvMapIntensity: { value: GLASS_MATERIAL.envMapIntensity },
        uBackgroundTexture: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  // Head drop animation
  useEffect(() => {
    if (headDropped) return;

    const dropStartY = 8;
    const dropEndY = 0.5; // Half-submerged
    const dropDuration = 2000; // 2 seconds
    const startTime = Date.now();
    void dropStartY; // Mark as used
    void dropEndY; // Mark as used

    const animateDrop = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dropDuration, 1);

      // Easing: ease out bounce
      let eased = progress;
      if (progress < 0.5) {
        eased = 4 * progress * progress * progress;
      } else {
        eased = 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }

      // Add bounce at the end
      if (progress > 0.8) {
        const bounceProgress = (progress - 0.8) / 0.2;
        const bounce = Math.sin(bounceProgress * Math.PI * 2) * (1 - bounceProgress) * 0.1;
        eased += bounce;
      }

      setDropProgress(eased);

      // Trigger impact ripple
      if (progress >= 0.7 && !impactOccurred) {
        setImpactOccurred(true);
        // Large impact ripple
        addRipple([0, 0], 2.0);
        // Secondary ripples
        setTimeout(() => addRipple([0.5, 0.3], 1.0), 100);
        setTimeout(() => addRipple([-0.3, 0.5], 0.8), 200);
      }

      if (progress < 1) {
        requestAnimationFrame(animateDrop);
      } else {
        setHeadDropped(true);
      }
    };

    // Start drop after scene is ready
    const timeout = setTimeout(() => {
      requestAnimationFrame(animateDrop);
    }, 500);

    return () => clearTimeout(timeout);
  }, [headDropped, impactOccurred, setHeadDropped, addRipple]);

  // Calculate position based on drop progress
  const headPosition = useMemo(() => {
    const startY = 8;
    const endY = 0.5;
    const y = startY + (endY - startY) * dropProgress;
    return [0, y, 0] as [number, number, number];
  }, [dropProgress]);

  // Update shader and rotation each frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update shader uniforms
    glassMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    glassMaterial.uniforms.uResolution.value.set(size.width, size.height);

    if (envMap) {
      glassMaterial.uniforms.uEnvironmentMap.value = envMap;
    }

    // Cursor-following rotation (subtle, max 10 degrees)
    if (headDropped && !settings.reduceMotion) {
      const maxRotation = Math.PI / 18; // ~10 degrees

      // Calculate target rotation based on cursor position
      const targetRotationY = pointer.x * maxRotation;
      const targetRotationX = -pointer.y * maxRotation * 0.5;

      // Update spring target
      rotationSpringRef.current.setTarget([targetRotationX, targetRotationY, 0]);

      // Update spring and apply rotation
      const rotation = rotationSpringRef.current.update(delta * 1000);
      meshRef.current.rotation.x = rotation[0];
      meshRef.current.rotation.y = rotation[1];
    }

    // Gentle bobbing motion when settled
    if (headDropped) {
      const bobAmount = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
      const rockAmount = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      meshRef.current.position.y = 0.5 + bobAmount;
      if (!settings.reduceMotion) {
        meshRef.current.rotation.z = rockAmount;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={headPosition}
      geometry={geometry}
      material={glassMaterial}
    />
  );
}
