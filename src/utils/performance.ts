import { useAppStore } from './store';

// GPU capability detection
interface GPUInfo {
  renderer: string;
  vendor: string;
  tier: 'high' | 'medium' | 'low';
}

export function detectGPU(): GPUInfo {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let renderer = 'Unknown';
  let vendor = 'Unknown';
  let tier: 'high' | 'medium' | 'low' = 'medium';

  if (gl && gl instanceof WebGLRenderingContext) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }

    // Detect tier based on known GPU strings
    const rendererLower = renderer.toLowerCase();

    // High-end GPUs
    if (
      rendererLower.includes('rtx') ||
      rendererLower.includes('radeon rx 6') ||
      rendererLower.includes('radeon rx 7') ||
      rendererLower.includes('apple m1') ||
      rendererLower.includes('apple m2') ||
      rendererLower.includes('apple m3') ||
      rendererLower.includes('gtx 1080') ||
      rendererLower.includes('gtx 1070') ||
      rendererLower.includes('gtx 2080') ||
      rendererLower.includes('nvidia geforce')
    ) {
      tier = 'high';
    }
    // Low-end GPUs
    else if (
      rendererLower.includes('intel hd') ||
      rendererLower.includes('intel uhd') ||
      rendererLower.includes('mali') ||
      rendererLower.includes('adreno 5') ||
      rendererLower.includes('powervr') ||
      rendererLower.includes('angle') ||
      rendererLower.includes('swiftshader')
    ) {
      tier = 'low';
    }
  }

  return { renderer, vendor, tier };
}

// Device capability detection
interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasMouse: boolean;
  supportsWebGL2: boolean;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  gpuTier: 'high' | 'medium' | 'low';
  recommendedQuality: 'high' | 'medium' | 'low';
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const ua = navigator.userAgent.toLowerCase();

  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

  const isTablet =
    /ipad|android(?!.*mobile)|tablet/i.test(ua) ||
    (navigator.maxTouchPoints > 0 &&
      window.innerWidth >= 768 &&
      window.innerWidth < 1024);

  const isDesktop = !isMobile && !isTablet;

  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  const hasMouse =
    window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // Check WebGL2 support
  const canvas = document.createElement('canvas');
  const supportsWebGL2 = !!canvas.getContext('webgl2');

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x

  const gpuInfo = detectGPU();

  // Determine recommended quality
  let recommendedQuality: 'high' | 'medium' | 'low' = 'medium';

  if (isDesktop && gpuInfo.tier === 'high' && supportsWebGL2) {
    recommendedQuality = 'high';
  } else if (isMobile || gpuInfo.tier === 'low') {
    recommendedQuality = 'low';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    hasMouse,
    supportsWebGL2,
    devicePixelRatio,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    gpuTier: gpuInfo.tier,
    recommendedQuality,
  };
}

// Quality settings based on performance mode
interface QualitySettings {
  // Resolution
  pixelRatio: number;

  // Mesh detail
  mercurySegments: number;
  headSegments: number;

  // Shaders
  maxRipples: number;
  noiseOctaves: number;

  // Post-processing
  bloomEnabled: boolean;
  bloomStrength: number;
  chromaticAberrationEnabled: boolean;
  dofEnabled: boolean;
  filmGrainEnabled: boolean;
  vignetteEnabled: boolean;

  // Particles
  particleCount: number;

  // Shadows
  shadowsEnabled: boolean;
  shadowMapSize: number;

  // Reflections
  envMapSize: number;

  // Animation
  targetFPS: number;
}

export function getQualitySettings(mode: 'high' | 'medium' | 'low'): QualitySettings {
  switch (mode) {
    case 'high':
      return {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        mercurySegments: 256,
        headSegments: 128,
        maxRipples: 10,
        noiseOctaves: 3,
        bloomEnabled: true,
        bloomStrength: 0.5,
        chromaticAberrationEnabled: true,
        dofEnabled: true,
        filmGrainEnabled: true,
        vignetteEnabled: true,
        particleCount: 100,
        shadowsEnabled: true,
        shadowMapSize: 2048,
        envMapSize: 512,
        targetFPS: 60,
      };

    case 'medium':
      return {
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        mercurySegments: 128,
        headSegments: 64,
        maxRipples: 6,
        noiseOctaves: 2,
        bloomEnabled: true,
        bloomStrength: 0.3,
        chromaticAberrationEnabled: false,
        dofEnabled: false,
        filmGrainEnabled: false,
        vignetteEnabled: true,
        particleCount: 50,
        shadowsEnabled: true,
        shadowMapSize: 1024,
        envMapSize: 256,
        targetFPS: 60,
      };

    case 'low':
      return {
        pixelRatio: 1,
        mercurySegments: 64,
        headSegments: 32,
        maxRipples: 3,
        noiseOctaves: 1,
        bloomEnabled: false,
        bloomStrength: 0,
        chromaticAberrationEnabled: false,
        dofEnabled: false,
        filmGrainEnabled: false,
        vignetteEnabled: false,
        particleCount: 0,
        shadowsEnabled: false,
        shadowMapSize: 512,
        envMapSize: 128,
        targetFPS: 30,
      };
  }
}

// FPS monitoring
class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private currentFPS: number = 60;
  private autoAdjust: boolean = true;
  private adjustCooldown: number = 0;

  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Calculate instantaneous FPS
    const fps = 1000 / delta;
    this.frames.push(fps);

    // Keep last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    // Calculate average FPS
    this.currentFPS = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;

    // Auto-adjust quality if needed
    if (this.autoAdjust && this.adjustCooldown <= 0) {
      this.checkPerformance();
    }

    if (this.adjustCooldown > 0) {
      this.adjustCooldown -= delta;
    }
  }

  private checkPerformance() {
    const { settings, updateSettings } = useAppStore.getState();

    // Downgrade if FPS is too low
    if (this.currentFPS < 30 && settings.performanceMode !== 'low') {
      const newMode = settings.performanceMode === 'high' ? 'medium' : 'low';
      updateSettings({ performanceMode: newMode });
      this.adjustCooldown = 5000; // Wait 5 seconds before next adjustment
      console.log(`Performance: Downgraded to ${newMode} mode (FPS: ${this.currentFPS.toFixed(1)})`);
    }
  }

  getFPS(): number {
    return this.currentFPS;
  }

  setAutoAdjust(enabled: boolean) {
    this.autoAdjust = enabled;
  }
}

export const fpsMonitor = new FPSMonitor();

// Visibility change handler (pause rendering when tab is hidden)
export function setupVisibilityHandler(
  onHide: () => void,
  onShow: () => void
): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onHide();
    } else {
      onShow();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// Intersection Observer for lazy loading
export function createLazyLoader(
  elements: Element[],
  onVisible: (element: Element) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onVisible(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  elements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

// Resource preloader
export async function preloadResources(
  resources: { type: 'image' | 'audio' | 'model'; src: string }[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  const total = resources.length;

  const promises = resources.map(async ({ type, src }) => {
    try {
      switch (type) {
        case 'image':
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = src;
          });
          break;

        case 'audio':
          await new Promise<void>((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve();
            audio.onerror = reject;
            audio.src = src;
          });
          break;

        case 'model':
          // Models are loaded by Three.js loaders
          await fetch(src);
          break;
      }

      loaded++;
      onProgress?.(loaded, total);
    } catch (error) {
      console.warn(`Failed to preload: ${src}`, error);
      loaded++;
      onProgress?.(loaded, total);
    }
  });

  await Promise.all(promises);
}
