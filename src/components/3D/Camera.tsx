import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../utils/store';
import { SCENE, TIMING, SPRING_CONFIGS } from '../../utils/constants';
import { Spring3D } from '../../utils/animations';

export function Camera() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const cameraAutoOrbit = useAppStore((state) => state.cameraAutoOrbit);
  const setCameraAutoOrbit = useAppStore((state) => state.setCameraAutoOrbit);
  const expandedCard = useAppStore((state) => state.expandedCard);
  const settings = useAppStore((state) => state.settings);

  // Spring for smooth camera transitions
  const positionSpringRef = useRef(
    new Spring3D(SCENE.cameraInitialPosition, SPRING_CONFIGS.camera)
  );
  const targetSpringRef = useRef(
    new Spring3D(SCENE.cameraTarget, SPRING_CONFIGS.camera)
  );

  // Track orbit angle
  const orbitAngleRef = useRef(0);
  const orbitRadiusRef = useRef(8);

  // Initialize camera position
  useEffect(() => {
    camera.position.set(...SCENE.cameraInitialPosition);
    camera.lookAt(...SCENE.cameraTarget);
  }, [camera]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Return to home position
        positionSpringRef.current.setTarget(SCENE.cameraInitialPosition);
        targetSpringRef.current.setTarget(SCENE.cameraTarget);
        orbitAngleRef.current = 0;
        setCameraAutoOrbit(true);
      }

      // Arrow keys for 90-degree rotation
      if (e.code === 'ArrowLeft') {
        orbitAngleRef.current -= Math.PI / 2;
      }
      if (e.code === 'ArrowRight') {
        orbitAngleRef.current += Math.PI / 2;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraAutoOrbit]);

  // Handle card expansion - focus camera on card
  useEffect(() => {
    if (expandedCard) {
      // Disable auto orbit when card is expanded
      setCameraAutoOrbit(false);
    } else {
      // Re-enable when card is closed
      setCameraAutoOrbit(true);
    }
  }, [expandedCard, setCameraAutoOrbit]);

  useFrame((_state, delta) => {
    if (!controlsRef.current) return;

    // Auto orbit when enabled and not interacting
    if (cameraAutoOrbit && !settings.reduceMotion) {
      // Slow orbital rotation
      orbitAngleRef.current += (delta / TIMING.cameraOrbitDuration) * Math.PI * 2 * 1000;

      const x = Math.sin(orbitAngleRef.current) * orbitRadiusRef.current;
      const z = Math.cos(orbitAngleRef.current) * orbitRadiusRef.current;
      const y = 2 + Math.sin(orbitAngleRef.current * 0.5) * 0.5; // Subtle vertical movement

      positionSpringRef.current.setTarget([x, y, z]);
    }

    // Update camera position via spring
    const newPosition = positionSpringRef.current.update(delta * 1000);
    camera.position.set(...newPosition);

    // Update look target via spring
    const newTarget = targetSpringRef.current.update(delta * 1000);
    controlsRef.current.target.set(...newTarget);

    controlsRef.current.update();
  });

  // Handle user interaction with controls
  const handleStart = () => {
    setCameraAutoOrbit(false);
  };

  const handleEnd = () => {
    // Resume auto orbit after 3 seconds of inactivity
    setTimeout(() => {
      const currentAutoOrbit = useAppStore.getState().cameraAutoOrbit;
      if (!currentAutoOrbit && !useAppStore.getState().expandedCard) {
        setCameraAutoOrbit(true);
      }
    }, 3000);
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={SCENE.cameraMinDistance}
      maxDistance={SCENE.cameraMaxDistance}
      minPolarAngle={Math.PI / 6} // Don't go below horizon
      maxPolarAngle={Math.PI / 2.2} // Don't go too high
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      onStart={handleStart}
      onEnd={handleEnd}
      // Right-click or two-finger drag to orbit
      mouseButtons={{
        LEFT: undefined,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      touches={{
        ONE: undefined,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
    />
  );
}
