// Color palette
export const COLORS = {
  // Mercury surface colors
  mercuryBase: '#C0C0C0',
  mercuryHighlight: '#E8E8E8',
  mercuryBlue: '#B8C4D0',

  // Glass tint
  glassTint: 'rgba(200, 220, 255, 1)',

  // Glassmorphic UI colors
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassBorderHover: 'rgba(255, 255, 255, 0.35)',
  glassText: '#FFFFFF',
  glassTextSecondary: 'rgba(255, 255, 255, 0.7)',

  // Accent colors
  accentBlue: '#4A9EFF',
  accentPurple: '#8B5CF6',
  accentGreen: '#10B981',

  // Background gradient colors
  bgDark: '#0A0A0F',
  bgMid: '#0F0F1A',
  bgPurple: '#1A0A2E',
} as const;

// Spring config interface
export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
}

// Animation configurations (spring physics)
export const SPRING_CONFIGS: Record<string, SpringConfig> = {
  // Fast, responsive animations
  snappy: {
    tension: 400,
    friction: 30,
    mass: 1,
  },

  // Card hover animation
  cardHover: {
    tension: 280,
    friction: 60,
    mass: 0.8,
  },

  // Smooth camera transitions
  camera: {
    tension: 120,
    friction: 40,
    mass: 1.5,
  },

  // Gentle floating motion
  float: {
    tension: 50,
    friction: 20,
    mass: 2,
  },

  // Elastic spring back
  elastic: {
    tension: 300,
    friction: 10,
    mass: 0.5,
  },

  // Slow, smooth transitions
  smooth: {
    tension: 100,
    friction: 26,
    mass: 1,
  },
};

// Timing constants (in ms)
export const TIMING = {
  // Camera orbit (full rotation)
  cameraOrbitDuration: 60000,

  // Mercury ripple lifetime
  rippleLifetime: 5000,

  // Card auto-rotation
  cardRotationDuration: 30000,

  // Loading screen minimum duration
  loadingMinDuration: 2000,

  // Hero tagline rotation
  taglineInterval: 4000,

  // UI hover delay
  hoverDelay: 50,

  // Transition durations
  transitionFast: 150,
  transitionMedium: 300,
  transitionSlow: 500,
} as const;

// 3D scene constants
export const SCENE = {
  // Glass head
  headRadius: 1.5,
  headSegments: 128,

  // Mercury surface
  mercurySize: 20,
  mercurySegments: 256,
  mercuryPosition: -0.5,

  // Camera
  cameraFov: 45,
  cameraInitialPosition: [0, 2, 8] as [number, number, number],
  cameraTarget: [0, 0, 0] as [number, number, number],
  cameraMinDistance: 5,
  cameraMaxDistance: 15,

  // Lighting
  keyLightPosition: [5, 8, 5] as [number, number, number],
  keyLightIntensity: 1.2,
  fillLight1Position: [-3, 2, 4] as [number, number, number],
  fillLight1Intensity: 0.4,
  fillLight2Position: [3, 2, -4] as [number, number, number],
  fillLight2Intensity: 0.3,
  rimLightPosition: [0, 3, -5] as [number, number, number],
  rimLightIntensity: 0.8,
  ambientIntensity: 0.2,

  // Cards
  cardCount: 8,
  cardOrbitRadiusMin: 3,
  cardOrbitRadiusMax: 5,
  cardZDepthMin: -1.5,
  cardZDepthMax: 2,
} as const;

// Glass material properties
export const GLASS_MATERIAL = {
  ior: 1.5,
  transmission: 0.95,
  thickness: 0.5,
  chromaticAberration: 0.06,
  roughness: 0.05,
  tintColor: [0.9, 0.95, 1.0] as [number, number, number],
  envMapIntensity: 1.5,
} as const;

// Mercury material properties
export const MERCURY_MATERIAL = {
  metalness: 1.0,
  roughness: 0.05,
  envMapIntensity: 2.0,
} as const;

// Ripple system
export const RIPPLE = {
  maxRipples: 10,
  waveSpeed: 3.0,
  waveFrequency: 8.0,
  decayRate: 0.3,
  initialStrength: 0.8,
  clickStrength: 1.2,
  hoverStrength: 0.3,
} as const;

// UI dimensions
export const UI = {
  navHeight: 56,
  musicPlayerWidth: 400,
  musicPlayerHeight: 88,
  cardWidth: 360,
  cardHeight: 280,
  statsTickerHeight: 64,
  contactButtonSize: 72,
  settingsButtonSize: 56,
  margin: 24,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920,
} as const;

// Sound file paths
export const SOUNDS = {
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  whoosh: '/sounds/whoosh.mp3',
  splash: '/sounds/splash.mp3',
  chime: '/sounds/chime.mp3',
} as const;

// Hero taglines (rotate every 4 seconds)
export const HERO_TAGLINES = [
  'Creator of 6-figure AI coaching platform',
  'Building the future of senior tech assistance',
  'UWaterloo CS Candidate \'2X',
  'Full-stack developer & AI enthusiast',
] as const;
