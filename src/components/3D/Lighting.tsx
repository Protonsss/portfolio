import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE } from '../../utils/constants';
import { useAppStore } from '../../utils/store';

export function Lighting() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLight1Ref = useRef<THREE.PointLight>(null);
  const fillLight2Ref = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.SpotLight>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);

  const settings = useAppStore((state) => state.settings);
  const cursorPosition = useAppStore((state) => state.cursorPosition);

  useFrame((state) => {
    // Subtle light animation
    if (keyLightRef.current && !settings.reduceMotion) {
      keyLightRef.current.intensity =
        SCENE.keyLightIntensity + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    // Cursor-following light
    if (cursorLightRef.current) {
      // Map cursor position to 3D space (approximate)
      const x = (cursorPosition.x / window.innerWidth - 0.5) * 10;
      const z = (cursorPosition.y / window.innerHeight - 0.5) * 10;
      cursorLightRef.current.position.set(x, 3, z);
    }
  });

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={SCENE.ambientIntensity} color="#4466aa" />

      {/* Key light - main directional light */}
      <directionalLight
        ref={keyLightRef}
        position={SCENE.keyLightPosition}
        intensity={SCENE.keyLightIntensity}
        color="#ffffff"
        castShadow={settings.performanceMode !== 'low'}
        shadow-mapSize-width={settings.performanceMode === 'high' ? 2048 : 1024}
        shadow-mapSize-height={settings.performanceMode === 'high' ? 2048 : 1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light 1 - blue tinted */}
      <pointLight
        ref={fillLight1Ref}
        position={SCENE.fillLight1Position}
        intensity={SCENE.fillLight1Intensity}
        color="#6688ff"
        distance={15}
        decay={2}
      />

      {/* Fill light 2 - warm tinted */}
      <pointLight
        ref={fillLight2Ref}
        position={SCENE.fillLight2Position}
        intensity={SCENE.fillLight2Intensity}
        color="#ffaa66"
        distance={15}
        decay={2}
      />

      {/* Rim light - backlight for edge definition */}
      <spotLight
        ref={rimLightRef}
        position={SCENE.rimLightPosition}
        intensity={SCENE.rimLightIntensity}
        color="#aaccff"
        angle={0.5}
        penumbra={0.5}
        distance={20}
        decay={2}
        target-position={[0, 0, 0]}
      />

      {/* Cursor-following point light */}
      <pointLight
        ref={cursorLightRef}
        position={[0, 3, 0]}
        intensity={0.3}
        color="#ffffff"
        distance={8}
        decay={2}
      />

      {/* Ground bounce light simulation */}
      <pointLight
        position={[0, -2, 0]}
        intensity={0.2}
        color="#8899aa"
        distance={10}
        decay={2}
      />
    </>
  );
}
