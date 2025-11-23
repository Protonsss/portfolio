import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Ripple data structure
export interface Ripple {
  id: string;
  position: [number, number];
  strength: number;
  time: number;
}

// Settings state
interface Settings {
  audioEnabled: boolean;
  theme: 'dark' | 'light';
  performanceMode: 'high' | 'medium' | 'low';
  fluidEnabled: boolean;
  reduceMotion: boolean;
  filmGrain: boolean;
  vignette: boolean;
  bloom: boolean;
}

// App state
interface AppState {
  // Loading
  isLoading: boolean;
  loadingProgress: number;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;

  // Scene state
  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;

  // Head drop animation
  headDropped: boolean;
  setHeadDropped: (dropped: boolean) => void;

  // Camera
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraAutoOrbit: boolean;
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setCameraAutoOrbit: (orbit: boolean) => void;

  // Ripples
  ripples: Ripple[];
  addRipple: (position: [number, number], strength: number) => void;
  clearExpiredRipples: () => void;

  // UI State
  activeSection: string;
  setActiveSection: (section: string) => void;

  expandedCard: string | null;
  setExpandedCard: (cardId: string | null) => void;

  hoveredCard: string | null;
  setHoveredCard: (cardId: string | null) => void;

  // Music player
  isPlaying: boolean;
  currentTrack: {
    title: string;
    artist: string;
    albumArt: string;
    duration: number;
  } | null;
  currentTime: number;
  volume: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: AppState['currentTrack']) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Cursor
  cursorPosition: { x: number; y: number };
  cursorType: 'default' | 'hover' | 'drag' | 'card';
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setCursorType: (type: AppState['cursorType']) => void;

  // Easter eggs
  konamiActivated: boolean;
  setKonamiActivated: (activated: boolean) => void;

  // Contact form
  contactFormOpen: boolean;
  setContactFormOpen: (open: boolean) => void;

  // Settings panel
  settingsPanelOpen: boolean;
  setSettingsPanelOpen: (open: boolean) => void;
}

// Generate unique ripple ID
const generateRippleId = () => `ripple-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Loading
      isLoading: true,
      loadingProgress: 0,
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingProgress: (progress) => set({ loadingProgress: progress }),

      // Scene state
      sceneReady: false,
      setSceneReady: (ready) => set({ sceneReady: ready }),

      // Head drop
      headDropped: false,
      setHeadDropped: (dropped) => set({ headDropped: dropped }),

      // Camera
      cameraPosition: [0, 2, 8],
      cameraTarget: [0, 0, 0],
      cameraAutoOrbit: true,
      setCameraPosition: (pos) => set({ cameraPosition: pos }),
      setCameraTarget: (target) => set({ cameraTarget: target }),
      setCameraAutoOrbit: (orbit) => set({ cameraAutoOrbit: orbit }),

      // Ripples
      ripples: [],
      addRipple: (position, strength) => {
        const newRipple: Ripple = {
          id: generateRippleId(),
          position,
          strength,
          time: Date.now(),
        };

        set((state) => {
          // Keep only last maxRipples
          const updatedRipples = [...state.ripples, newRipple].slice(-10);
          return { ripples: updatedRipples };
        });
      },
      clearExpiredRipples: () => {
        const now = Date.now();
        set((state) => ({
          ripples: state.ripples.filter((r) => now - r.time < 5000),
        }));
      },

      // UI State
      activeSection: 'home',
      setActiveSection: (section) => set({ activeSection: section }),

      expandedCard: null,
      setExpandedCard: (cardId) => set({ expandedCard: cardId }),

      hoveredCard: null,
      setHoveredCard: (cardId) => set({ hoveredCard: cardId }),

      // Music player
      isPlaying: false,
      currentTrack: {
        title: 'Midnight City',
        artist: 'M83',
        albumArt: '/album-placeholder.jpg',
        duration: 243,
      },
      currentTime: 0,
      volume: 0.7,
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setVolume: (volume) => set({ volume: volume }),

      // Settings
      settings: {
        audioEnabled: true,
        theme: 'dark',
        performanceMode: 'high',
        fluidEnabled: true,
        reduceMotion: false,
        filmGrain: false,
        vignette: true,
        bloom: true,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Cursor
      cursorPosition: { x: 0, y: 0 },
      cursorType: 'default',
      setCursorPosition: (pos) => set({ cursorPosition: pos }),
      setCursorType: (type) => set({ cursorType: type }),

      // Easter eggs
      konamiActivated: false,
      setKonamiActivated: (activated) => set({ konamiActivated: activated }),

      // Contact form
      contactFormOpen: false,
      setContactFormOpen: (open) => set({ contactFormOpen: open }),

      // Settings panel
      settingsPanelOpen: false,
      setSettingsPanelOpen: (open) => set({ settingsPanelOpen: open }),
    }),
    {
      name: 'portfolio-settings',
      partialize: (state) => ({
        settings: state.settings,
        volume: state.volume,
      }),
    }
  )
);
