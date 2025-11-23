import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { HERO_TAGLINES, TIMING } from '../../utils/constants';
import { motionSpringPresets } from '../../utils/animations';
import { playClick } from '../../utils/audio';

export function HeroText() {
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const addRipple = useAppStore((state) => state.addRipple);

  const name = 'Stephen Chen';
  const title = 'Full-Stack Developer & AI Builder';

  // Typewriter effect for name
  useEffect(() => {
    if (!isTyping) return;

    let index = 0;
    const text = name;
    setDisplayedText('');

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, []);

  // Rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, TIMING.taglineInterval);

    return () => clearInterval(interval);
  }, []);

  const handleCTAClick = useCallback(() => {
    playClick();
    setActiveSection('projects');
    addRipple([0, 0], 1.5);

    // Scroll to projects section
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [setActiveSection, addRipple]);

  return (
    <motion.div
      className="hero-text glass glass-noise"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, ...motionSpringPresets.smooth }}
      style={{
        position: 'fixed',
        left: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'min(500px, calc(100vw - 48px))',
        padding: '40px',
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Name with typewriter effect */}
      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700,
          marginBottom: '12px',
          letterSpacing: '-0.02em',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {(isTyping ? displayedText : name).split('').map((letter, i) => (
          <motion.span
            key={i}
            onMouseEnter={() => setHoveredLetter(i)}
            onMouseLeave={() => setHoveredLetter(null)}
            animate={{
              y: hoveredLetter === i ? -5 : 0,
              color: hoveredLetter === i ? '#4A9EFF' : '#ffffff',
            }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'inline-block',
              cursor: 'default',
              whiteSpace: letter === ' ' ? 'pre' : 'normal',
            }}
          >
            {letter}
          </motion.span>
        ))}

        {/* Typing cursor */}
        {isTyping && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              background: '#4A9EFF',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
            }}
          />
        )}
      </h1>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '24px',
        }}
      >
        {title}
      </motion.h2>

      {/* Rotating tagline */}
      <div
        style={{
          height: '28px',
          marginBottom: '32px',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTaglineIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.5,
            }}
          >
            {HERO_TAGLINES[currentTaglineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={handleCTAClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: 'relative',
          padding: '14px 28px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          // Gradient fill on hover
          const button = e.currentTarget;
          button.style.background = 'linear-gradient(135deg, #4A9EFF, #8B5CF6)';
          button.style.borderColor = 'transparent';
        }}
        onMouseLeave={(e) => {
          const button = e.currentTarget;
          button.style.background = 'rgba(255, 255, 255, 0.1)';
          button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        View Projects
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          →
        </motion.span>
      </motion.button>

      {/* Decorative elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '6px',
          height: '6px',
          background: '#4A9EFF',
          borderRadius: '50%',
        }}
        animate={{
          boxShadow: [
            '0 0 10px #4A9EFF',
            '0 0 20px #4A9EFF',
            '0 0 10px #4A9EFF',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      <motion.div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '40px',
          height: '1px',
          background: 'linear-gradient(90deg, #4A9EFF, transparent)',
        }}
      />
    </motion.div>
  );
}
