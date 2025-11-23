import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { GlassHeadLoadingScene } from '../3D/GlassHeadLoadingScene';

export function LoadingScreen() {
  const isLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [holdingEscape, setHoldingEscape] = useState(false);
  const [escapeHoldProgress, setEscapeHoldProgress] = useState(0);

  // Show skip hint after 2 seconds
  useEffect(() => {
    let timer: number;
    if (isLoading) {
      timer = window.setTimeout(() => {
        setShowSkipHint(true);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle ESC key to skip (hold for 2s)
  useEffect(() => {
    let holdInterval: number;
    let progress = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !holdingEscape) {
        setHoldingEscape(true);
        progress = 0;

        holdInterval = window.setInterval(() => {
          progress += 0.05; // 50ms intervals
          setEscapeHoldProgress(progress);

          if (progress >= 1) {
            clearInterval(holdInterval);
            setLoading(false);
          }
        }, 50);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoldingEscape(false);
        setEscapeHoldProgress(0);
        clearInterval(holdInterval);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(holdInterval);
    };
  }, [holdingEscape, setLoading]);

  const handleComplete = () => {
    // Delay slightly to allow final animation to breathe
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
          }}
        >
          {/* Cinematic loading animation */}
          <GlassHeadLoadingScene onComplete={handleComplete} />

          {/* Skip hint */}
          <AnimatePresence>
            {showSkipHint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                  }}
                >
                  Hold ESC to skip
                </div>

                {/* Progress bar for hold */}
                {holdingEscape && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: escapeHoldProgress }}
                    style={{
                      width: '120px',
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      transformOrigin: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #4A9EFF, #8B5CF6)',
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
