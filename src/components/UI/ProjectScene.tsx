import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CreatorOSCanvas } from '../3D/ProjectScenes/CreatorOSCanvas';

interface ProjectSceneProps {
    projectId: string;
    color: string;
}

export function ProjectScene({ projectId, color }: ProjectSceneProps) {
    const [animationStage, setAnimationStage] = useState(0);

    useEffect(() => {
        // Progress through animation stages
        const timers = [
            setTimeout(() => setAnimationStage(1), 300),
            setTimeout(() => setAnimationStage(2), 800),
            setTimeout(() => setAnimationStage(3), 1400),
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    const scenes = {
        'creator-os': <CreatorOSScene color={color} stage={animationStage} />,
        'dorothy': <DorothyScene color={color} stage={animationStage} />,
        'mealmate-ads': <MealMateScene color={color} stage={animationStage} />,
        'academic': <AcademicScene color={color} stage={animationStage} />,
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {scenes[projectId as keyof typeof scenes] || null}
        </div>
    );
}

// CreatorOS: Building a Champion (NOW WITH 3D!)
function CreatorOSScene({ color, stage }: { color: string; stage: number }) {
    return (
        <div style={{ width: '100%', height: '350px', position: 'relative' }}>
            {/* Professional 3D WebGL Scene */}
            <CreatorOSCanvas color={color} stage={stage} />

            {/* Overlay title */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: `0 0 20px ${color}40`,
                }}
            >
                Building Champions
            </motion.div>
        </div>
    );
}

// Dorothy: Bridging Generations
function DorothyScene({ color, stage }: { color: string; stage: number }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Stage 1: Scattered tech devices */}
            {stage >= 1 && (
                <>
                    <TechDevice type="phone" x="15%" y="25%" rotation={-25} delay={0} color={color} />
                    <TechDevice type="tablet" x="75%" y="35%" rotation={15} delay={0.1} color={color} />
                    <TechDevice type="laptop" x="40%" y="65%" rotation={-15} delay={0.2} color={color} />
                </>
            )}

            {/* Stage 2: Helping hand appears */}
            {stage >= 2 && (
                <GuidingHand color={color} />
            )}

            {/* Stage 3: Organized & peaceful */}
            {stage >= 3 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <GuidingLight color={color} />
                </motion.div>
            )}

            {/* Floating question marks → light bulbs */}
            <TransformingIcons color={color} stage={stage} />
        </div>
    );
}

// MealMate: Precision Automation
function MealMateScene({ color, stage }: { color: string; stage: number }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Stage 1: Data streams */}
            {stage >= 1 && (
                <>
                    <DataStream color={color} delay={0} x="20%" />
                    <DataStream color={color} delay={0.15} x="50%" />
                    <DataStream color={color} delay={0.3} x="80%" />
                </>
            )}

            {/* Stage 2: Spinning gears */}
            {stage >= 2 && (
                <>
                    <Gear size={60} speed={2} x="35%" y="45%" color={color} />
                    <Gear size={40} speed={-3} x="60%" y="50%" color={color} />
                </>
            )}

            {/* Stage 3: ROAS explosion */}
            {stage >= 3 && (
                <ROASCounter targetValue={250} color={color} />
            )}

            {/* Background: Live charts */}
            <MiniChart color={color} />
        </div>
    );
}

// Academic: Pursuit of Excellence
function AcademicScene({ color, stage }: { color: string; stage: number }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Stage 1: Flying books */}
            {stage >= 1 && (
                <>
                    <FlyingBook x="20%" y="30%" delay={0} color={color} />
                    <FlyingBook x="70%" y="45%" delay={0.15} color={color} />
                    <FlyingBook x="45%" y="60%" delay={0.3} color={color} />
                </>
            )}

            {/* Stage 2: Solving equations */}
            {stage >= 2 && (
                <SolvingEquation color={color} />
            )}

            {/* Stage 3: Championship trophy */}
            {stage >= 3 && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <ChampionTrophy color={color} />
                </motion.div>
            )}

            {/* Background: Math formulas */}
            <FloatingFormulas color={color} />
        </div>
    );
}

// Reusable animated components

function DataNode({ color, delay, x, y, label }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 150 }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                background: `${color}15`,
                border: `2px solid ${color}50`,
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#fff',
                fontWeight: 600,
                boxShadow: `0 0 20px ${color}30`,
                backdropFilter: 'blur(10px)',
            }}
        >
            {label}
        </motion.div>
    );
}

function NetworkLine({ from, to, color, delay }: any) {
    const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

    return (
        <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.6 }}
            transition={{ delay, duration: 0.5 }}
            style={{
                position: 'absolute',
                left: `${from.x}%`,
                top: `${from.y}%`,
                width: `${length}%`,
                height: '2px',
                background: `linear-gradient(90deg, ${color}80, ${color}40)`,
                transformOrigin: 'left center',
                transform: `rotate(${angle}deg)`,
                filter: `drop-shadow(0 0 4px ${color})`,
            }}
        />
    );
}

function Trophy({ color }: { color: string }) {
    return (
        <motion.svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
            {/* Trophy base */}
            <rect x="35" y="75" width="30" height="10" fill={color} opacity="0.8" rx="2" />
            <rect x="40" y="65" width="20" height="10" fill={color} opacity="0.9" rx="1" />

            {/* Trophy cup */}
            <path
                d="M 30 30 Q 30 65 50 65 Q 70 65 70 30 Z"
                fill={`url(#trophy-gradient-${color})`}
                stroke={color}
                strokeWidth="2"
            />

            {/* Handles */}
            <path d="M 25 35 Q 15 40 20 50" fill="none" stroke={color} strokeWidth="3" opacity="0.7" />
            <path d="M 75 35 Q 85 40 80 50" fill="none" stroke={color} strokeWidth="3" opacity="0.7" />

            {/* Shine */}
            <ellipse cx="45" cy="40" rx="8" ry="12" fill="white" opacity="0.3" />

            <defs>
                <linearGradient id={`trophy-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
            </defs>
        </motion.svg>
    );
}

function BackgroundParticles({ color }: { color: string }) {
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${Math.random() * 100}%`,
                        y: '120%',
                        opacity: 0
                    }}
                    animate={{
                        y: '-20%',
                        opacity: [0, 0.4, 0],
                    }}
                    transition={{
                        duration: 8 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: color,
                        borderRadius: '50%',
                        filter: `blur(1px)`,
                    }}
                />
            ))}
        </div>
    );
}

function TechDevice({ type, x, y, rotation, delay, color }: any) {
    const icons = {
        phone: '📱',
        tablet: '💻',
        laptop: '🖥️',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, rotate: rotation + 90 }}
            animate={{ opacity: 1, scale: 1, rotate: rotation }}
            transition={{ delay, type: 'spring', stiffness: 100 }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                fontSize: '40px',
                filter: `drop-shadow(0 4px 12px ${color}40)`,
            }}
        >
            {icons[type as keyof typeof icons]}
        </motion.div>
    );
}

function GuidingHand({ color }: { color: string }) {
    return (
        <motion.svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{
                position: 'absolute',
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%)',
                filter: `drop-shadow(0 0 20px ${color})`,
            }}
        >
            <path
                d="M 40 20 L 40 40 M 30 30 L 40 40 L 50 30"
                stroke={color}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="40" cy="50" r="15" fill={color} opacity="0.2" />
        </motion.svg>
    );
}

function GuidingLight({ color }: { color: string }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}60, transparent)`,
                boxShadow: `0 0 40px ${color}80`,
            }}
        />
    );
}

function TransformingIcons({ color, stage }: { color: string; stage: number }) {
    return (
        <>
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        y: [100, -100],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: i * 0.8,
                    }}
                    style={{
                        position: 'absolute',
                        left: `${10 + i * 12}%`,
                        top: '80%',
                        fontSize: '20px',
                    }}
                >
                    {stage >= 3 ? '💡' : '❓'}
                </motion.div>
            ))}
        </>
    );
}

function DataStream({ color, delay, x }: any) {
    return (
        <div style={{ position: 'absolute', left: x, top: 0, height: '100%' }}>
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 400, opacity: [0, 1, 0] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: delay + i * 0.3,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        width: '3px',
                        height: '20px',
                        background: `linear-gradient(180deg, transparent, ${color})`,
                        borderRadius: '2px',
                    }}
                />
            ))}
        </div>
    );
}

function Gear({ size, speed, x, y, color }: any) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                filter: `drop-shadow(0 0 10px ${color}40)`,
            }}
        >
            <path
                d="M50,10 L60,25 L75,25 L70,40 L80,50 L70,60 L75,75 L60,75 L50,90 L40,75 L25,75 L30,60 L20,50 L30,40 L25,25 L40,25 Z"
                fill={color}
                opacity="0.8"
            />
            <circle cx="50" cy="50" r="15" fill="#000" opacity="0.3" />
        </motion.svg>
    );
}

function ROASCounter({ targetValue, color }: { targetValue: number; color: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = targetValue / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                setCount(targetValue);
                clearInterval(interval);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [targetValue]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '64px',
                fontWeight: 900,
                color,
                textShadow: `0 0 30px ${color}80`,
            }}
        >
            {count}% ROAS
        </motion.div>
    );
}

function MiniChart({ color }: { color: string }) {
    return (
        <svg
            width="200"
            height="60"
            viewBox="0 0 200 60"
            style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                opacity: 0.4,
            }}
        >
            <motion.polyline
                points="0,50 40,30 80,40 120,20 160,25 200,10"
                fill="none"
                stroke={color}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
            />
        </svg>
    );
}

function FlyingBook({ x, y, delay, color }: any) {
    return (
        <motion.div
            initial={{ x: -200, y: -100, rotate: -45, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 80 }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                fontSize: '36px',
                filter: `drop-shadow(0 4px 12px ${color}40)`,
            }}
        >
            📚
        </motion.div>
    );
}

function SolvingEquation({ color }: { color: string }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => (s + 1) % 3);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    const equations = [
        'x² + 5x + 6 = 0',
        '(x + 2)(x + 3) = 0',
        'x = -2, -3 ✓',
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'absolute',
                left: '50%',
                top: '35%',
                transform: 'translate(-50%, -50%)',
                fontSize: '20px',
                fontFamily: 'monospace',
                color,
                textShadow: `0 0 10px ${color}40`,
            }}
        >
            {equations[step]}
        </motion.div>
    );
}

function ChampionTrophy({ color }: { color: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{ fontSize: '80px', filter: `drop-shadow(0 8px 24px ${color}60)` }}
            >
                🏆
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                }}
            >
                Zone Champion
            </motion.div>
        </div>
    );
}

function FloatingFormulas({ color }: { color: string }) {
    const formulas = ['∑', '∫', 'π', '∞', '√', '≈', 'θ', 'λ'];

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {formulas.map((formula, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${Math.random() * 100}%`,
                        y: '120%',
                        opacity: 0
                    }}
                    animate={{
                        y: '-20%',
                        opacity: [0, 0.2, 0],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 8,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        fontSize: '24px',
                        color,
                        fontFamily: 'serif',
                    }}
                >
                    {formula}
                </motion.div>
            ))}
        </div>
    );
}
