import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { playHover, playClick, playWhoosh } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export function Navigation() {
  const activeSection = useAppStore((state) => state.activeSection);
  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const setCameraAutoOrbit = useAppStore((state) => state.setCameraAutoOrbit);
  const addRipple = useAppStore((state) => state.addRipple);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Tab navigation is handled by browser
        return;
      }

      // Number keys for quick navigation
      const num = parseInt(e.key);
      if (num >= 1 && num <= navItems.length) {
        e.preventDefault();
        handleNavClick(navItems[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setCameraAutoOrbit(false);
    playClick();
    playWhoosh();

    // Create ripple effect
    addRipple([Math.random() * 2 - 1, Math.random() * 2 - 1], 0.6);

    // Smooth scroll to section (if sections exist in DOM)
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }

    // Re-enable auto orbit after navigation
    setTimeout(() => {
      setCameraAutoOrbit(true);
    }, 2000);
  };

  return (
    <motion.nav
      className="navigation glass glass-noise"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionSpringPresets.snappy}
      style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        gap: '4px',
        zIndex: 100,
      }}
    >
      {navItems.map((item, index) => {
        const isActive = activeSection === item.id;
        const isHovered = hoveredItem === item.id;

        return (
          <motion.button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            onMouseEnter={() => {
              setHoveredItem(item.id);
              playHover();
            }}
            onMouseLeave={() => setHoveredItem(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'relative',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'color 0.2s ease',
            }}
          >
            {/* Active/hover background */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: isActive
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: isActive
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid transparent',
              }}
              initial={false}
              animate={{
                opacity: isActive || isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Mercury fill animation for active item */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '50%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #4A9EFF, #8B5CF6)',
                  borderRadius: '1px',
                }}
                initial={{ width: 0, x: '-50%' }}
                animate={{ width: '60%', x: '-50%' }}
                transition={motionSpringPresets.snappy}
              />
            )}

            {/* Label */}
            <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
          </motion.button>
        );
      })}

      {/* Scroll progress indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          background: 'rgba(74, 158, 255, 0.5)',
          borderRadius: '0 0 8px 8px',
        }}
        animate={{ width: `${scrollProgress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </motion.nav>
  );
}
