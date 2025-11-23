import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * Beautiful space environment background
 * Award-winning quality with animated stars, nebula, and depth
 */
export function SpaceEnvironment() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Star field
        const stars: Array<{
            x: number;
            y: number;
            z: number;
            size: number;
            opacity: number;
        }> = [];

        // Create 200 stars with depth
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 1000,
                size: Math.random() * 2,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }

        let animationFrame: number;
        let time = 0;

        const animate = () => {
            time += 0.001;

            // Create deep space gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0a0a0f');
            gradient.addColorStop(0.5, '#0f0f1a');
            gradient.addColorStop(1, '#1a0a2e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw nebula (soft glow)
            const nebulaGradient = ctx.createRadialGradient(
                canvas.width * 0.6,
                canvas.height * 0.4,
                0,
                canvas.width * 0.6,
                canvas.height * 0.4,
                canvas.width * 0.8
            );
            nebulaGradient.addColorStop(0, 'rgba(74, 158, 255, 0.05)');
            nebulaGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
            nebulaGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars with parallax
            stars.forEach((star) => {
                // Parallax movement
                const parallax = (1000 - star.z) / 1000;
                const x = star.x + Math.sin(time + star.z) * parallax * 0.5;
                const y = star.y + Math.cos(time * 0.5 + star.z) * parallax * 0.3;

                // Calculate star size based on depth
                const scale = (1000 - star.z) / 1000;
                const size = star.size * scale;

                // Twinkle effect
                const twinkle = Math.sin(time * 2 + star.z) * 0.3 + 0.7;
                const opacity = star.opacity * twinkle * scale;

                // Draw star
                ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();

                // Add glow for larger stars
                if (size > 1.2) {
                    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                    glowGradient.addColorStop(0, `rgba(200, 220, 255, ${opacity * 0.3})`);
                    glowGradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = glowGradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <>
            {/* Canvas star field */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            {/* Gradient overlays for depth */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 30%, rgba(74, 158, 255, 0.05), transparent 50%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.04), transparent 60%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * 100}vh`,
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, `${Math.random() * 100}vh`],
                        opacity: [0, 0.3, 0],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'fixed',
                        width: '2px',
                        height: '2px',
                        background: '#4A9EFF',
                        borderRadius: '50%',
                        boxShadow: '0 0 6px #4A9EFF',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </>
    );
}
