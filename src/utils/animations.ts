import { SPRING_CONFIGS, TIMING } from './constants';
import type { SpringConfig } from './constants';

// Easing functions
export const easing = {
  // Standard easing
  linear: (t: number) => t,

  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number) => Math.sqrt(1 - --t * t),
  easeInOutCirc: (t: number) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

  // Elastic easing
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  // Bounce
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInBounce: (t: number) => 1 - easing.easeOutBounce(1 - t),
};

// Spring physics simulation
export class Spring {
  private position: number;
  private velocity: number;
  private target: number;
  private tension: number;
  private friction: number;
  private mass: number;

  constructor(
    initialValue: number = 0,
    config: SpringConfig = { tension: 400, friction: 30, mass: 1 }
  ) {
    this.position = initialValue;
    this.velocity = 0;
    this.target = initialValue;
    this.tension = config.tension;
    this.friction = config.friction;
    this.mass = config.mass;
  }

  setTarget(target: number) {
    this.target = target;
  }

  update(deltaTime: number): number {
    // Convert to seconds
    const dt = Math.min(deltaTime / 1000, 0.064); // Cap at ~15fps minimum

    // Spring force: F = -k * x
    const displacement = this.position - this.target;
    const springForce = -this.tension * displacement;

    // Damping force: F = -c * v
    const dampingForce = -this.friction * this.velocity;

    // Acceleration: a = F / m
    const acceleration = (springForce + dampingForce) / this.mass;

    // Update velocity and position
    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;

    return this.position;
  }

  getValue(): number {
    return this.position;
  }

  isAtRest(threshold: number = 0.001): boolean {
    return (
      Math.abs(this.velocity) < threshold &&
      Math.abs(this.position - this.target) < threshold
    );
  }

  reset(value: number) {
    this.position = value;
    this.velocity = 0;
    this.target = value;
  }
}

// Spring for 3D vectors
export class Spring3D {
  private springs: [Spring, Spring, Spring];

  constructor(
    initialValue: [number, number, number] = [0, 0, 0],
    config = SPRING_CONFIGS.snappy
  ) {
    this.springs = [
      new Spring(initialValue[0], config),
      new Spring(initialValue[1], config),
      new Spring(initialValue[2], config),
    ];
  }

  setTarget(target: [number, number, number]) {
    this.springs[0].setTarget(target[0]);
    this.springs[1].setTarget(target[1]);
    this.springs[2].setTarget(target[2]);
  }

  update(deltaTime: number): [number, number, number] {
    return [
      this.springs[0].update(deltaTime),
      this.springs[1].update(deltaTime),
      this.springs[2].update(deltaTime),
    ];
  }

  getValue(): [number, number, number] {
    return [
      this.springs[0].getValue(),
      this.springs[1].getValue(),
      this.springs[2].getValue(),
    ];
  }

  isAtRest(threshold?: number): boolean {
    return this.springs.every((s) => s.isAtRest(threshold));
  }
}

// Lerp helper
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Vector lerp
export function lerpVector3(
  start: [number, number, number],
  end: [number, number, number],
  t: number
): [number, number, number] {
  return [
    lerp(start[0], end[0], t),
    lerp(start[1], end[1], t),
    lerp(start[2], end[2], t),
  ];
}

// Clamp helper
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Map range helper
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Smooth step (for smooth transitions)
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Stagger delay calculator for sequential animations
export function getStaggerDelay(
  index: number,
  total: number,
  totalDuration: number = 500,
  staggerRatio: number = 0.5
): number {
  const staggerDuration = totalDuration * staggerRatio;
  return (index / (total - 1)) * staggerDuration;
}

// Animation frame loop helper
export function createAnimationLoop(
  callback: (deltaTime: number) => void,
  fps: number = 60
): { start: () => void; stop: () => void } {
  let animationFrameId: number | null = null;
  let lastTime = 0;
  const interval = 1000 / fps;

  const loop = (currentTime: number) => {
    animationFrameId = requestAnimationFrame(loop);

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= interval) {
      lastTime = currentTime - (deltaTime % interval);
      callback(deltaTime);
    }
  };

  return {
    start: () => {
      if (!animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
      }
    },
    stop: () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
}

// Framer Motion spring presets
export const motionSpringPresets = {
  snappy: {
    type: 'spring' as const,
    stiffness: SPRING_CONFIGS.snappy.tension,
    damping: SPRING_CONFIGS.snappy.friction,
    mass: SPRING_CONFIGS.snappy.mass,
  },
  cardHover: {
    type: 'spring' as const,
    stiffness: SPRING_CONFIGS.cardHover.tension,
    damping: SPRING_CONFIGS.cardHover.friction,
    mass: SPRING_CONFIGS.cardHover.mass,
  },
  smooth: {
    type: 'spring' as const,
    stiffness: SPRING_CONFIGS.smooth.tension,
    damping: SPRING_CONFIGS.smooth.friction,
    mass: SPRING_CONFIGS.smooth.mass,
  },
  elastic: {
    type: 'spring' as const,
    stiffness: SPRING_CONFIGS.elastic.tension,
    damping: SPRING_CONFIGS.elastic.friction,
    mass: SPRING_CONFIGS.elastic.mass,
  },
};

// CSS transition helper
export function createTransition(
  properties: string[],
  duration: number = TIMING.transitionMedium,
  easing: string = 'cubic-bezier(0.4, 0, 0.2, 1)'
): string {
  return properties.map((prop) => `${prop} ${duration}ms ${easing}`).join(', ');
}
