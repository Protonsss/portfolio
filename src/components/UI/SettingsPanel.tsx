import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { playClick, playHover } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';

interface ToggleProps {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, icon, checked, onChange }: ToggleProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={() => {
        onChange(!checked);
        playClick();
      }}
      onMouseEnter={() => playHover()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
      </div>

      {/* Toggle switch */}
      <div
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: checked
            ? 'linear-gradient(135deg, #4A9EFF, #8B5CF6)'
            : 'rgba(255, 255, 255, 0.1)',
          padding: '2px',
          transition: 'background 0.2s ease',
        }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>
    </motion.div>
  );
}

interface SelectProps {
  label: string;
  icon: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Select({ label, icon, options, value, onChange }: SelectProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => {
              onChange(option.value);
              playClick();
            }}
            onMouseEnter={() => playHover()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background:
                value === option.value
                  ? 'linear-gradient(135deg, #4A9EFF, #8B5CF6)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              transition: 'background 0.2s ease',
            }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const settingsPanelOpen = useAppStore((state) => state.settingsPanelOpen);
  const setSettingsPanelOpen = useAppStore((state) => state.setSettingsPanelOpen);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const togglePanel = () => {
    playClick();
    setSettingsPanelOpen(!settingsPanelOpen);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '136px', // Below music player
        right: '24px',
        zIndex: 100,
      }}
    >
      {/* Settings button */}
      <motion.button
        onClick={togglePanel}
        onMouseEnter={() => playHover()}
        whileHover={{ scale: 1.1, rotate: 45 }}
        whileTap={{ scale: 0.95 }}
        className="glass"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: settingsPanelOpen
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(255, 255, 255, 0.08)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
        }}
      >
        ⚙️
      </motion.button>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsPanelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={motionSpringPresets.snappy}
            className="glass glass-noise"
            style={{
              position: 'absolute',
              top: '64px',
              right: 0,
              width: '320px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚙️</span> Settings
            </h3>

            {/* Audio toggle */}
            <Toggle
              label="Audio"
              icon="🎵"
              checked={settings.audioEnabled}
              onChange={(checked) => updateSettings({ audioEnabled: checked })}
            />

            {/* Performance mode */}
            <Select
              label="Performance"
              icon="⚡"
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Med' },
                { value: 'low', label: 'Low' },
              ]}
              value={settings.performanceMode}
              onChange={(value) =>
                updateSettings({
                  performanceMode: value as 'high' | 'medium' | 'low',
                })
              }
            />

            {/* Fluid animation toggle */}
            <Toggle
              label="Fluid Animation"
              icon="🌊"
              checked={settings.fluidEnabled}
              onChange={(checked) => updateSettings({ fluidEnabled: checked })}
            />

            {/* Reduce motion toggle */}
            <Toggle
              label="Reduce Motion"
              icon="📹"
              checked={settings.reduceMotion}
              onChange={(checked) => updateSettings({ reduceMotion: checked })}
            />

            {/* Effects section */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.6,
                  marginBottom: '12px',
                }}
              >
                Visual Effects
              </p>

              <Toggle
                label="Bloom"
                icon="✨"
                checked={settings.bloom}
                onChange={(checked) => updateSettings({ bloom: checked })}
              />

              <Toggle
                label="Vignette"
                icon="🎬"
                checked={settings.vignette}
                onChange={(checked) => updateSettings({ vignette: checked })}
              />

              <Toggle
                label="Film Grain"
                icon="📽️"
                checked={settings.filmGrain}
                onChange={(checked) => updateSettings({ filmGrain: checked })}
              />
            </div>

            {/* Reset button */}
            <motion.button
              onClick={() => {
                updateSettings({
                  audioEnabled: true,
                  performanceMode: 'high',
                  fluidEnabled: true,
                  reduceMotion: false,
                  bloom: true,
                  vignette: true,
                  filmGrain: false,
                });
                playClick();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 500,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Reset to Defaults
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
