import { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import { GlassHead } from './GlassHead';
import { MercurySurface } from './MercurySurface';
import { Camera } from './Camera';
import { Lighting } from './Lighting';
import { Particles } from './Particles';
import { FloatingCards } from './FloatingCards';
import { useAppStore } from '../../utils/store';
import { getQualitySettings } from '../../utils/performance';

// Scene content component
function SceneContent() {
  const settings = useAppStore((state) => state.settings);
  const setSceneReady = useAppStore((state) => state.setSceneReady);

  // Signal scene is ready after first render
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSceneReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, [setSceneReady]);

  return (
    <>
      {/* Camera controls */}
      <Camera />

      {/* Lighting setup */}
      <Lighting />

      {/* Environment map for reflections */}
      <Environment
        preset="night"
        background={false}
      />

      {/* Glass head */}
      <GlassHead />

      {/* Mercury surface */}
      {settings.fluidEnabled && <MercurySurface />}

      {/* Floating particles - reduced count for stability */}
      <Particles count={50} />

      {/* Floating cards in 3D space */}
      <FloatingCards />

      {/* Preload assets */}
      <Preload all />
    </>
  );
}

// Post-processing effects
function PostProcessing() {
  const settings = useAppStore((state) => state.settings);
  const qualitySettings = useMemo(
    () => getQualitySettings(settings.performanceMode),
    [settings.performanceMode]
  );

  // Early return for low performance mode
  if (settings.performanceMode === 'low') {
    return null;
  }

  // Build effects array based on settings
  const effects: React.ReactElement[] = [];

  if (qualitySettings.bloomEnabled && settings.bloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={qualitySettings.bloomStrength}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    );
  }

  if (qualitySettings.chromaticAberrationEnabled) {
    effects.push(
      <ChromaticAberration
        key="chromatic"
        offset={new THREE.Vector2(0.002, 0.002)}
        radialModulation={true}
        modulationOffset={0.5}
      />
    );
  }

  // Disabled DepthOfField by default - too expensive and can cause crashes
  // if (qualitySettings.dofEnabled) {
  //   effects.push(
  //     <DepthOfField
  //       key="dof"
  //       focusDistance={0.01}
  //       focalLength={0.02}
  //       bokehScale={2}
  //     />
  //   );
  // }


  if (qualitySettings.vignetteEnabled && settings.vignette) {
    effects.push(
      <Vignette
        key="vignette"
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    );
  }

  if (qualitySettings.filmGrainEnabled && settings.filmGrain) {
    effects.push(
      <Noise
        key="noise"
        opacity={0.02}
        blendFunction={BlendFunction.OVERLAY}
      />
    );
  }

  // Need at least one effect for EffectComposer
  if (effects.length === 0) {
    return null;
  }

  return (
    <EffectComposer>
      {effects}
    </EffectComposer>
  );
}

// Main Scene component
export function Scene() {
  const settings = useAppStore((state) => state.settings);
  const qualitySettings = useMemo(
    () => getQualitySettings(settings.performanceMode),
    [settings.performanceMode]
  );

  return (
    <div className="scene-container">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={qualitySettings.pixelRatio}
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [0, 2, 8],
        }}
        shadows={qualitySettings.shadowsEnabled}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <color attach="background" args={['#0a0a0f']} />

        <Suspense fallback={null}>
          <SceneContent />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  );
}
