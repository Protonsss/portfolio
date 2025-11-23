import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAppStore } from '../../utils/store';
import { projects } from '../../data/projects';
import { skills } from '../../data/skills';
import { playHover, playClick } from '../../utils/audio';

interface CardData {
  id: string;
  type: 'project' | 'skill';
  title: string;
  tagline: string;
  metrics: { label: string; value: string }[];
  icon: string;
  color: string;
  proficiency?: number;
  subskills?: string[];
}

const cardData: CardData[] = [
  ...projects.map((p) => ({
    id: p.id,
    type: 'project' as const,
    title: p.title,
    tagline: p.tagline,
    metrics: p.metrics,
    icon: p.icon,
    color: p.color,
  })),
  ...skills.map((s) => ({
    id: s.id,
    type: 'skill' as const,
    title: s.name,
    tagline: s.description,
    metrics: [{ label: 'Proficiency', value: `${s.proficiency}%` }],
    icon: s.icon,
    color: s.color,
    proficiency: s.proficiency,
    subskills: s.subskills,
  })),
];

interface FloatingCardProps {
  data: CardData;
  index: number;
  total: number;
  carouselRotation: number;
}

function FloatingCard({ data, index, total, carouselRotation }: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardDomRef = useRef<HTMLDivElement>(null);
  const edgeGlowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const hoveredCard = useAppStore((state) => state.hoveredCard);
  const setHoveredCard = useAppStore((state) => state.setHoveredCard);
  const setExpandedCard = useAppStore((state) => state.setExpandedCard);
  const addRipple = useAppStore((state) => state.addRipple);
  const settings = useAppStore((state) => state.settings);

  const basePosition = useMemo(() => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 5;

    return {
      angle,
      radius,
      y: 0.8,
    };
  }, [index, total]);

  const floatOffset = useMemo(() => ({
    phase: Math.random() * Math.PI * 2,
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const currentAngle = basePosition.angle + carouselRotation;
    const x = Math.cos(currentAngle) * basePosition.radius;
    const z = Math.sin(currentAngle) * basePosition.radius;

    const breathe = settings.reduceMotion ? 0 : Math.sin(time * 0.5 + floatOffset.phase) * 0.05;

    groupRef.current.position.set(x, basePosition.y + breathe, z);
    groupRef.current.lookAt(state.camera.position);
  });

  const handlePointerEnter = () => {
    setIsHovered(true);
    setHoveredCard(data.id);
    playHover();
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setHoveredCard(null);
    setMousePos({ x: 0, y: 0 });

    // Reset 3D transform with elastic ease
    if (cardDomRef.current) {
      gsap.to(cardDomRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardDomRef.current || !isHovered) return;

    const rect = cardDomRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized position (-1 to 1)
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientX - centerY) / (rect.height / 2);

    setMousePos({ x, y });

    // Apply 3D tilt (Zentry-style)
    gsap.to(cardDomRef.current, {
      rotateX: -y * 12, // Max ±12 degrees
      rotateY: x * 12,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Move edge glow to follow cursor
    if (edgeGlowRef.current) {
      gsap.to(edgeGlowRef.current, {
        x: x * 30,
        y: y * 30,
        opacity: 0.8,
        duration: 0.2,
      });
    }
  };

  const handleClick = () => {
    setExpandedCard(data.id);
    playClick();
    const currentAngle = basePosition.angle + carouselRotation;
    const x = Math.cos(currentAngle) * basePosition.radius;
    const z = Math.sin(currentAngle) * basePosition.radius;
    addRipple([x * 0.3, z * 0.3], 0.8);
  };

  const isDimmed = hoveredCard !== null && hoveredCard !== data.id;

  return (
    <group ref={groupRef}>
      <Html
        transform
        occlude
        distanceFactor={5}
        style={{
          transition: 'all 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          transform: isHovered ? 'translateZ(60px) scale(1.05)' : 'translateZ(0) scale(1)',
          opacity: isDimmed ? 0.25 : 1,
          filter: isDimmed ? 'blur(4px) brightness(0.8)' : 'none',
          pointerEvents: 'auto',
        }}
      >
        <motion.div
          ref={cardDomRef}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.6, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            delay: index * 0.08,
            duration: 0.8,
            type: 'spring',
            stiffness: 80,
            damping: 15,
          }}
          style={{
            width: '240px',
            height: '140px',
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            background: `
              linear-gradient(135deg, ${data.color}12 0%, ${data.color}05 100%),
              linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)
            `,
            backdropFilter: 'blur(80px) saturate(180%)',
            WebkitBackdropFilter: 'blur(80px) saturate(180%)',
            borderRadius: '20px',
            border: `1px solid ${isHovered ? `${data.color}50` : `${data.color}20`}`,
            boxShadow: isHovered
              ? `
                0 24px 48px -12px ${data.color}20,
                0 12px 24px -6px rgba(0, 0, 0, 0.3),
                0 0 0 1px ${data.color}15,
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
              : `
                0 8px 24px -4px rgba(0, 0, 0, 0.2),
                0 4px 8px -2px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.08)
              `,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px',
            transition: 'all 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {/* Dynamic edge glow that follows cursor */}
          <div
            ref={edgeGlowRef}
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle, ${data.color}60 0%, transparent 70%)`,
              filter: 'blur(25px)',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Subtle edge highlight */}
          <div
            style={{
              position: 'absolute',
              top: '1px',
              left: '20px',
              right: '20px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              opacity: isHovered ? 0.8 : 0.4,
              transition: 'opacity 0.6s ease',
            }}
          />

          {/* Subtle gradient overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at ${isHovered ? '50%' : '35%'} ${isHovered ? '40%' : '25%'}, ${data.color}08 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0.6,
              transition: 'all 0.8s cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: 'none',
            }}
          />

          {/* Micro shimmer on hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: [0, 0.3, 0], x: '200%' }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Content with parallax layers */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              transform: `translate3d(${mousePos.x * 3}px, ${mousePos.y * 3}px, 20px)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <motion.h3
              animate={{
                scale: isHovered ? 1.01 : 1,
              }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              style={{
                fontSize: '22px',
                fontWeight: 700,
                marginBottom: '6px',
                background: `linear-gradient(135deg, #ffffff 0%, ${data.color}cc 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                textShadow: isHovered ? `0 0 20px ${data.color}20` : 'none',
                transition: 'text-shadow 0.6s ease',
              }}
            >
              {data.title}
            </motion.h3>

            <motion.div
              animate={{ opacity: isHovered ? 1 : 0.85 }}
              transition={{ duration: 0.4 }}
              style={{
                fontSize: '14px',
                color: data.color,
                fontWeight: 600,
                marginTop: '8px',
                filter: `drop-shadow(0 0 8px ${data.color}30)`,
              }}
            >
              {data.metrics[0]?.value}
            </motion.div>

            {/* Type indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: data.color,
                opacity: isHovered ? 0.7 : 0.4,
                fontWeight: 600,
                transition: 'opacity 0.4s ease',
              }}
            >
              {data.type}
            </div>
          </div>

          {/* Subtle corner accent */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              width: '2px',
              height: '2px',
              background: data.color,
              borderRadius: '50%',
              boxShadow: `0 0 8px ${data.color}${isHovered ? '80' : '40'}`,
              opacity: isHovered ? 1 : 0.5,
              transition: 'all 0.6s ease',
            }}
          />

          {/* Bottom edge subtle glow */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '20%',
              right: '20%',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${data.color}30, transparent)`,
              opacity: isHovered ? 0.6 : 0.2,
              transition: 'opacity 0.6s ease',
            }}
          />
        </motion.div>
      </Html>
    </group>
  );
}

export function FloatingCards() {
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const { gl } = useThree();

  // Smoother damping
  useFrame((_state, delta) => {
    const dampingFactor = 6;
    const diff = targetRotation - currentRotation;
    const change = diff * dampingFactor * delta;
    setCurrentRotation((prev) => prev + change);
  });

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rotationSpeed = 0.002; // Slightly slower for more control
      setTargetRotation((prev) => prev + event.deltaY * rotationSpeed);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      canvas.removeEventListener('wheel', handleWheel, { capture: true } as any);
    };
  }, [gl]);

  return (
    <group>
      {cardData.map((data, index) => (
        <FloatingCard
          key={data.id}
          data={data}
          index={index}
          total={cardData.length}
          carouselRotation={currentRotation}
        />
      ))}
    </group>
  );
}
