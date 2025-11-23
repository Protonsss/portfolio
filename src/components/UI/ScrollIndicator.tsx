import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { playHover, playClick, playWhoosh } from '../../utils/audio';

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export function ScrollIndicator() {
  const activeSection = useAppStore((state) => state.activeSection);
  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const addRipple = useAppStore((state) => state.addRipple);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);

      // Update active section based on scroll position
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  const handleSectionClick = (sectionId: string) => {
    playClick();
    playWhoosh();
    setActiveSection(sectionId);
    addRipple([Math.random() - 0.5, Math.random() - 0.5], 0.5);

    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const indicator = document.querySelector('.scroll-indicator') as HTMLElement;
    if (!indicator) return;

    const rect = indicator.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const progress = Math.max(0, Math.min(1, relativeY / rect.height));

    // Scroll to position
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * scrollHeight });
  };

  // Drag handlers
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => handleDrag(e);
      const handleUp = () => setIsDragging(false);

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDragging]);

  const activeIndex = sections.findIndex((s) => s.id === activeSection);

  return (
    <motion.div
      className="scroll-indicator glass"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
      style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 8px',
        gap: '8px',
        zIndex: 50,
      }}
    >
      {/* Track line */}
      <div
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        style={{
          position: 'relative',
          width: '4px',
          height: '160px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        {/* Progress fill */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            borderRadius: '2px',
            background: 'linear-gradient(180deg, #4A9EFF, #8B5CF6)',
          }}
          animate={{ height: `${scrollProgress * 100}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Section markers */}
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          const position = (index / (sections.length - 1)) * 100;

          return (
            <motion.div
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              onMouseEnter={() => {
                setHoveredSection(section.id);
                playHover();
              }}
              onMouseLeave={() => setHoveredSection(null)}
              whileHover={{ scale: 1.5 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: `${position}%`,
                transform: 'translate(-50%, -50%)',
                width: isActive ? '10px' : '6px',
                height: isActive ? '10px' : '6px',
                borderRadius: '50%',
                background: isActive ? '#4A9EFF' : 'rgba(255, 255, 255, 0.3)',
                boxShadow: isActive ? '0 0 10px #4A9EFF' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 1,
              }}
            >
              {/* Tooltip */}
              {hoveredSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '6px 12px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {section.label}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current section label */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.6,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          marginTop: '8px',
        }}
      >
        {sections[activeIndex]?.label}
      </motion.div>
    </motion.div>
  );
}
