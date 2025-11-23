import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { BeatDetector, playClick } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';

// Demo tracks (replace with actual audio URLs)
const tracks = [
  {
    title: 'Midnight City',
    artist: 'M83',
    albumArt: 'https://picsum.photos/seed/album1/200/200',
    src: '/music/track1.mp3',
    duration: 243,
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    albumArt: 'https://picsum.photos/seed/album2/200/200',
    src: '/music/track2.mp3',
    duration: 200,
  },
];

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const beatDetectorRef = useRef<BeatDetector | null>(null);

  const isPlaying = useAppStore((state) => state.isPlaying);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const currentTime = useAppStore((state) => state.currentTime);
  const setCurrentTime = useAppStore((state) => state.setCurrentTime);
  const volume = useAppStore((state) => state.volume);
  const setVolume = useAppStore((state) => state.setVolume);
  const settings = useAppStore((state) => state.settings);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [frequencyBands, setFrequencyBands] = useState<number[]>(new Array(8).fill(0));
  const [isDragging] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay was prevented
        console.log('Playback prevented by browser');
      });
      setIsPlaying(true);

      // Initialize beat detector
      if (!beatDetectorRef.current && audioRef.current) {
        beatDetectorRef.current = new BeatDetector();
        beatDetectorRef.current.init(audioRef.current);
      }
    }
    playClick();
  }, [isPlaying, setIsPlaying]);

  // Update time
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }

      // Update frequency bands for visualization
      if (beatDetectorRef.current && isPlaying) {
        const bands = beatDetectorRef.current.getFrequencyBands(8);
        setFrequencyBands(bands);
      }
    };

    const handleEnded = () => {
      // Auto-advance to next track
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging, isPlaying, setCurrentTime, setIsPlaying]);

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle progress bar click/drag
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (currentTrack?.duration || 0);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0;

  if (!settings.audioEnabled) return null;

  return (
    <motion.div
      className="music-player glass glass-noise"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionSpringPresets.snappy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowVolume(false);
      }}
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        width: '400px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 100,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isHovered
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          : undefined,
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack?.src} preload="metadata" />

      {/* Album art with visualizer overlay */}
      <motion.div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
        animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        <img
          src={currentTrack?.albumArt}
          alt={currentTrack?.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Audio visualizer bars */}
        {isPlaying && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '0 4px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
            }}
          >
            {frequencyBands.map((value, i) => (
              <motion.div
                key={i}
                style={{
                  width: '4px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '2px',
                }}
                animate={{ height: `${Math.max(4, value * 20)}px` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Track info and controls */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title and artist */}
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentTrack?.title || 'No track selected'}
          </div>
          <div
            style={{
              fontSize: '12px',
              opacity: 0.7,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentTrack?.artist}
          </div>
        </div>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            cursor: 'pointer',
            position: 'relative',
            marginBottom: '4px',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: 'linear-gradient(90deg, #4A9EFF, #8B5CF6)',
              borderRadius: '2px',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />

          {/* Progress thumb */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              opacity: isHovered ? 1 : 0,
            }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Time display */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            opacity: 0.6,
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack?.duration || 0)}</span>
        </div>
      </div>

      {/* Play/Pause button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
        }}
      >
        {isPlaying ? '❚❚' : '▶'}
      </motion.button>

      {/* Volume control */}
      <div style={{ position: 'relative' }}>
        <motion.button
          onMouseEnter={() => setShowVolume(true)}
          whileHover={{ scale: 1.1 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            opacity: 0.7,
          }}
        >
          {volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔇'}
        </motion.button>

        {/* Volume slider popup */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '8px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '100px',
                  height: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, #4A9EFF 0%, #4A9EFF ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
