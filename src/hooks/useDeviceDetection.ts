import { useState, useEffect, useMemo } from 'react';
import { BREAKPOINTS } from '../utils/constants';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLaptop: boolean;
  isWide: boolean;
  hasTouch: boolean;
  hasMouse: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  isReducedMotion: boolean;
  breakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'wide';
}

export function useDeviceDetection(): DeviceInfo {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  const [screenHeight, setScreenHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 1080
  );

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const deviceInfo = useMemo((): DeviceInfo => {
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    const hasMouse =
      window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    const isReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Determine breakpoint
    let breakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'wide';
    if (screenWidth < BREAKPOINTS.tablet) {
      breakpoint = 'mobile';
    } else if (screenWidth < BREAKPOINTS.laptop) {
      breakpoint = 'tablet';
    } else if (screenWidth < BREAKPOINTS.desktop) {
      breakpoint = 'laptop';
    } else if (screenWidth < BREAKPOINTS.wide) {
      breakpoint = 'desktop';
    } else {
      breakpoint = 'wide';
    }

    return {
      isMobile: screenWidth < BREAKPOINTS.tablet,
      isTablet: screenWidth >= BREAKPOINTS.tablet && screenWidth < BREAKPOINTS.laptop,
      isLaptop: screenWidth >= BREAKPOINTS.laptop && screenWidth < BREAKPOINTS.desktop,
      isDesktop: screenWidth >= BREAKPOINTS.desktop,
      isWide: screenWidth >= BREAKPOINTS.wide,
      hasTouch,
      hasMouse,
      screenWidth,
      screenHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      isReducedMotion,
      breakpoint,
    };
  }, [screenWidth, screenHeight]);

  return deviceInfo;
}

// Hook to get responsive values
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  laptop?: T;
  desktop?: T;
  wide?: T;
  default: T;
}): T {
  const { breakpoint } = useDeviceDetection();

  return useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return values.mobile ?? values.default;
      case 'tablet':
        return values.tablet ?? values.mobile ?? values.default;
      case 'laptop':
        return values.laptop ?? values.tablet ?? values.default;
      case 'desktop':
        return values.desktop ?? values.laptop ?? values.default;
      case 'wide':
        return values.wide ?? values.desktop ?? values.default;
      default:
        return values.default;
    }
  }, [breakpoint, values]);
}

// Hook to check if screen matches a media query
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
