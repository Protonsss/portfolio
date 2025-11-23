```
import { useEffect } from 'react';
import { MusicPlayer } from './components/UI/MusicPlayer';
import { Navigation } from './components/UI/Navigation';
import { HeroText } from './components/UI/HeroText';
import { StatsTicker } from './components/UI/StatsTicker';
import { ContactPanel } from './components/UI/ContactPanel';
import { SettingsPanel } from './components/UI/SettingsPanel';
import { ScrollIndicator } from './components/UI/ScrollIndicator';
import { LoadingScreen } from './components/UI/LoadingScreen';
import { CustomCursor } from './components/UI/CustomCursor';
import { ExpandedCardModal } from './components/UI/ExpandedCardModal';
import { useEasterEggs } from './hooks/useEasterEggs';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { audioManager } from './utils/audio';
import { fpsMonitor } from './utils/performance';
import { useAppStore } from './utils/store';
import { Scene } from './components/3D/Scene';
import { CardScene } from './components/3D/CardScene';

import './styles/globals.css';

function App() {
  const isLoading = useAppStore((state) => state.isLoading);
  const settings = useAppStore((state) => state.settings);
  const { isMobile, isTablet } = useDeviceDetection();

  // Initialize easter eggs
  useEasterEggs();

  // Initialize audio manager
  useEffect(() => {
    audioManager.init();
    return () => {
      audioManager.destroy();
    };
  }, []);

  // FPS monitoring
  useEffect(() => {
    if (settings.performanceMode === 'high') {
      const animate = () => {
        fpsMonitor.update();
        requestAnimationFrame(animate);
      };
      const frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }
  }, [settings.performanceMode]);

  // Apply theme class
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return (
    <div className="app">
      {/* Background gradient */}
      <div className="background-gradient" />

      {/* Loading screen */}
      <LoadingScreen />

      {/* Main content (hidden during loading) */}
      {!isLoading && (
        <>
          {/* 3D Scene */}
          <Scene />

          {/* UI Overlay */}
          <div className="ui-overlay">
            {/* Top navigation */}
            <Navigation />

            {/* Music player - hide on mobile */}
            {!isMobile && <MusicPlayer />}

            {/* Settings panel */}
            {!isMobile && <SettingsPanel />}

            {/* Hero text */}
            <HeroText />

            {/* Stats ticker - hide on mobile */}
            {!isMobile && <StatsTicker />}

            {/* Scroll indicator - hide on mobile/tablet */}
            {!isMobile && !isTablet && <ScrollIndicator />}

            {/* Contact panel */}
            <ContactPanel />
          </div>

          {/* Expanded card modal */}
          <ExpandedCardModal />

          {/* Custom cursor - desktop only */}
          {!isMobile && !isTablet && <CustomCursor />}
        </>
      )}
    </div>
  );
}

export default App;
