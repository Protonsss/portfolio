import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { playHover, playClick } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';

interface Stat {
  id: string;
  icon: string;
  label: string;
  value: string;
  numericValue?: number;
  section?: string;
}

const stats: Stat[] = [
  { id: 'revenue', icon: '💰', label: '6-Figure Revenue', value: '$100K+', numericValue: 100000, section: 'projects' },
  { id: 'startups', icon: '🚀', label: '2 Startups Built', value: '2', numericValue: 2, section: 'projects' },
  { id: 'champion', icon: '🏆', label: 'Zone Champion', value: 'Winner', section: 'projects' },
  { id: 'education', icon: '🎓', label: 'UWaterloo Bound', value: 'CS 2X', section: 'about' },
  { id: 'athletes', icon: '🏃', label: 'Athletes Trained', value: '500+', numericValue: 500, section: 'projects' },
  { id: 'roas', icon: '📈', label: 'Ad Campaign ROAS', value: '250%', numericValue: 250, section: 'projects' },
];

// Animated counter component
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (value >= 1000) {
      return `${Math.round(latest / 1000)}K+`;
    }
    if (value >= 100) {
      return `${Math.round(latest)}+`;
    }
    return Math.round(latest).toString();
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [count, value, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatsTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const addRipple = useAppStore((state) => state.addRipple);

  // Trigger animation when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const handleStatClick = (stat: Stat) => {
    playClick();
    if (stat.section) {
      setActiveSection(stat.section);
      addRipple([Math.random() - 0.5, Math.random() - 0.5], 0.5);

      const section = document.getElementById(stat.section);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="stats-ticker glass glass-noise"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, ...motionSpringPresets.smooth }}
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '16px 32px',
        zIndex: 50,
        maxWidth: 'calc(100vw - 48px)',
        overflowX: 'auto',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {stats.map((stat, index) => {
        const isHovered = hoveredStat === stat.id;

        return (
          <motion.div
            key={stat.id}
            onClick={() => handleStatClick(stat)}
            onMouseEnter={() => {
              setHoveredStat(stat.id);
              playHover();
            }}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Icon with pulse animation */}
            <motion.span
              animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '20px' }}
            >
              {stat.icon}
            </motion.span>

            {/* Stat content */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                {stat.numericValue && hasAnimated ? (
                  <AnimatedNumber value={stat.numericValue} />
                ) : (
                  stat.value
                )}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {stat.label}
              </span>
            </div>

            {/* Separator */}
            {index < stats.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  right: '-12px',
                  height: '24px',
                  width: '1px',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
