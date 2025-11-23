import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlassHeadLoadingSceneProps {
    onComplete?: () => void;
}

/**
 * Simplified but elegant loading screen
 * Focuses on smooth 2D animation instead of complex WebGL to avoid context loss
 */
export function GlassHeadLoadingScene({ onComplete }: GlassHeadLoadingSceneProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 3500); // 3.5 seconds - enough to see the animation
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #1a0a2e 100%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {/* Animated particles (CSS-based for stability) */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${(Math.random() - 0.5) * 200}vw`,
                        y: `${(Math.random() - 0.5) * 200}vh`,
                        scale: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: ['50vw', `${50 + (Math.sin(i) * 10)}vw`],
                        y: ['50vh', `${50 + (Math.cos(i) * 10)}vh`],
                        scale: [0, 1, 0.8],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: 3,
                        delay: i * 0.05,
                        ease: [0.32, 0.72, 0, 1],
                    }}
                    style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, #4A9EFF 0%, transparent 70%)`,
                        boxShadow: '0 0 10px #4A9EFF',
                    }}
                />
            ))}

            {/* Center glow */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.5, 1],
                    opacity: [0, 0.8, 0.6],
                }}
                transition={{
                    duration: 2,
                    delay: 1,
                    ease: [0.32, 0.72, 0, 1],
                }}
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(74, 158, 255, 0.4) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />

            {/* Logo or text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    delay: 2,
                    ease: [0.32, 0.72, 0, 1],
                }}
                style={{
                    position: 'absolute',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontWeight: 600,
                }}
            >
                Stephen Chen
            </motion.div>
        </motion.div>
    );
}
