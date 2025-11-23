import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAppStore } from '../../utils/store';

export function CustomCursor() {
  const cursorPosition = useAppStore((state) => state.cursorPosition);
  const setCursorPosition = useAppStore((state) => state.setCursorPosition);
  const cursorType = useAppStore((state) => state.cursorType);
  const setCursorType = useAppStore((state) => state.setCursorType);
  const settings = useAppStore((state) => state.settings);

  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  // Spring-animated cursor position
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springX = useSpring(cursorX, {
    stiffness: 500,
    damping: 28,
    mass: 0.5,
  });

  const springY = useSpring(cursorY, {
    stiffness: 500,
    damping: 28,
    mass: 0.5,
  });

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      // Update trail
      trailRef.current.push({ x: e.clientX, y: e.clientY });
      if (trailRef.current.length > 10) {
        trailRef.current.shift();
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    // Add custom cursor class to body
    document.body.classList.add('custom-cursor');

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.classList.remove('custom-cursor');
    };
  }, [setCursorPosition, cursorX, cursorY]);

  // Detect hoverable elements
  useEffect(() => {
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for interactive elements
      const isButton = target.tagName === 'BUTTON';
      const isLink = target.tagName === 'A';
      const isCard = target.closest('.floating-card') !== null;
      const isClickable = target.closest('[data-cursor="pointer"]') !== null;
      const isDraggable = target.closest('[data-cursor="drag"]') !== null;

      if (isCard) {
        setCursorType('card');
      } else if (isDraggable) {
        setCursorType('drag');
      } else if (isButton || isLink || isClickable) {
        setCursorType('hover');
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mouseover', handleElementHover);
    return () => window.removeEventListener('mouseover', handleElementHover);
  }, [setCursorType]);

  // Don't render on touch devices or if reduce motion is enabled
  if (settings.reduceMotion || 'ontouchstart' in window) {
    return null;
  }

  // Cursor size based on state
  const getCursorSize = () => {
    if (isClicking) return { size: 12, ring: 40 };
    switch (cursorType) {
      case 'hover':
        return { size: 8, ring: 44 };
      case 'card':
        return { size: 6, ring: 56 };
      case 'drag':
        return { size: 10, ring: 48 };
      default:
        return { size: 8, ring: 32 };
    }
  };

  const { size, ring } = getCursorSize();

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          pointerEvents: 'none',
          zIndex: 10000,
          mixBlendMode: 'difference',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Cursor ring */}
      <motion.div
        className="cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          width: ring,
          height: ring,
          marginLeft: -ring / 2,
          marginTop: -ring / 2,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        animate={{
          opacity: isVisible ? (cursorType === 'default' ? 0.3 : 0.6) : 0,
          scale: isClicking ? 0.9 : 1,
          borderColor:
            cursorType === 'card'
              ? 'rgba(74, 158, 255, 0.8)'
              : cursorType === 'hover'
              ? 'rgba(139, 92, 246, 0.8)'
              : 'rgba(255, 255, 255, 0.5)',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          key={Date.now()}
          initial={{
            x: cursorPosition.x,
            y: cursorPosition.y,
            scale: 0,
            opacity: 0.5,
          }}
          animate={{
            scale: 2,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            borderRadius: '50%',
            border: '2px solid rgba(74, 158, 255, 0.6)',
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      )}

      {/* Cursor label for card hover */}
      {cursorType === 'card' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            x: springX,
            y: springY,
            marginLeft: 20,
            marginTop: 20,
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            color: 'white',
            pointerEvents: 'none',
            zIndex: 10001,
            whiteSpace: 'nowrap',
          }}
        >
          Click to view
        </motion.div>
      )}

      {/* Particle trail (optional) */}
      {!settings.reduceMotion && trailRef.current.length > 0 && (
        <svg
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9997,
          }}
        >
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(74, 158, 255, 0)" />
              <stop offset="100%" stopColor="rgba(74, 158, 255, 0.3)" />
            </linearGradient>
          </defs>
          {trailRef.current.length > 1 && (
            <motion.path
              d={`M ${trailRef.current.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              stroke="url(#trailGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>
      )}
    </>
  );
}
