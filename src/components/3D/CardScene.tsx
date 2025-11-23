import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { FloatingCards } from './FloatingCards';

/**
 * ENTERPRISE-QUALITY 3D CARD SCENE
 * Integrates premium FloatingCards with beautiful space environment
 */
export function CardScene() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
        }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                style={{ pointerEvents: 'none' }}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: 'high-performance',
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} color="#4A9EFF" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

                    {/* Premium floating cards */}
                    <FloatingCards />
                </Suspense>
            </Canvas>
        </div>
    );
}
