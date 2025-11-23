import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../utils/store';

// Konami code sequence
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useEasterEggs() {
  const konamiActivated = useAppStore((state) => state.konamiActivated);
  const setKonamiActivated = useAppStore((state) => state.setKonamiActivated);
  const addRipple = useAppStore((state) => state.addRipple);

  const konamiIndexRef = useRef(0);
  const headClickCountRef = useRef(0);
  const lastHeadClickTimeRef = useRef(0);
  const keySequenceRef = useRef<string[]>([]);

  // Konami code detector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Konami code
      if (e.code === KONAMI_CODE[konamiIndexRef.current]) {
        konamiIndexRef.current++;

        if (konamiIndexRef.current === KONAMI_CODE.length) {
          // Konami code complete!
          setKonamiActivated(true);
          konamiIndexRef.current = 0;

          // Trigger golden mercury + confetti
          triggerKonamiEffect();
        }
      } else {
        konamiIndexRef.current = 0;
      }

      // Track key sequences for other easter eggs
      keySequenceRef.current.push(e.key.toLowerCase());
      if (keySequenceRef.current.length > 10) {
        keySequenceRef.current.shift();
      }

      // Check for "matrix" command
      const sequence = keySequenceRef.current.join('');
      if (sequence.includes('matrix')) {
        triggerMatrixEffect();
        keySequenceRef.current = [];
      }

      // Check for "skip" command (for music)
      if (sequence.includes('skip')) {
        // Trigger skip track (would need to connect to music player)
        console.log('Skip track easter egg triggered');
        keySequenceRef.current = [];
      }

      // Check for "shuffle" command
      if (sequence.includes('shuffle')) {
        console.log('Shuffle easter egg triggered');
        keySequenceRef.current = [];
      }
    };

    // Spacebar for slow-motion
    let slowMotionTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleKeyDownSlow = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        // Prevent default only if not in an input
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();

          // Start slow motion after holding for 500ms
          slowMotionTimeout = setTimeout(() => {
            document.body.style.setProperty('--animation-speed', '0.3');
            document.body.classList.add('slow-motion');
          }, 500);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (slowMotionTimeout) {
          clearTimeout(slowMotionTimeout);
        }
        document.body.style.removeProperty('--animation-speed');
        document.body.classList.remove('slow-motion');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDownSlow);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDownSlow);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKonamiActivated]);

  // Check for midnight message
  useEffect(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      // Show midnight message
      console.log('Still coding at midnight? Impressive dedication! 🌙');
    }
  }, []);

  // Device shake detection (for mobile)
  useEffect(() => {
    let shakeThreshold = 15;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        triggerShakeEffect();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [addRipple]);

  // Head click counter for wink easter egg
  const handleHeadClick = useCallback(() => {
    const now = Date.now();

    // Reset counter if more than 2 seconds since last click
    if (now - lastHeadClickTimeRef.current > 2000) {
      headClickCountRef.current = 0;
    }

    headClickCountRef.current++;
    lastHeadClickTimeRef.current = now;

    if (headClickCountRef.current >= 10) {
      // Trigger wink animation
      triggerWinkEffect();
      headClickCountRef.current = 0;
    }
  }, []);

  // Effect triggers
  const triggerKonamiEffect = () => {
    console.log('🎮 Konami Code Activated! Golden mercury mode enabled.');

    // Create confetti
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    // Generate confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${['#FFD700', '#FFA500', '#FF6347', '#4A9EFF', '#8B5CF6'][Math.floor(Math.random() * 5)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        transform: rotate(${Math.random() * 360}deg);
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
      `;
      container.appendChild(confetti);
    }

    // Add confetti animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        to {
          top: 100%;
          transform: rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px);
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup after animation
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 5000);

    // Add golden mercury class
    document.body.classList.add('golden-mercury');

    // Remove after 10 seconds
    setTimeout(() => {
      document.body.classList.remove('golden-mercury');
    }, 10000);
  };

  const triggerMatrixEffect = () => {
    console.log('🟢 Matrix mode activated!');

    const container = document.createElement('div');
    container.className = 'matrix-overlay';
    container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
      background: transparent;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    // Create matrix rain
    const columns = Math.floor(window.innerWidth / 20);
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.style.cssText = `
        position: absolute;
        left: ${i * 20}px;
        top: -100%;
        font-family: monospace;
        font-size: 14px;
        color: #00ff00;
        text-shadow: 0 0 5px #00ff00;
        animation: matrix-fall ${5 + Math.random() * 5}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;

      // Generate random characters
      const chars = '01アイウエオカキクケコサシスセソタチツテト';
      let text = '';
      for (let j = 0; j < 30; j++) {
        text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
      }
      column.innerHTML = text;

      container.appendChild(column);
    }

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes matrix-fall {
        from { transform: translateY(-100%); }
        to { transform: translateY(100vh); }
      }
    `;
    document.head.appendChild(style);

    // Remove after 10 seconds
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 10000);
  };

  const triggerShakeEffect = () => {
    console.log('📱 Device shake detected! Chaos mode!');

    // Add multiple rapid ripples
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        addRipple(
          [Math.random() * 4 - 2, Math.random() * 4 - 2],
          1.5 + Math.random()
        );
      }, i * 50);
    }
  };

  const triggerWinkEffect = () => {
    console.log('😉 Head wink triggered!');
    // This would need to connect to the GlassHead component
    // to trigger a wink animation
  };

  return {
    handleHeadClick,
    konamiActivated,
  };
}
