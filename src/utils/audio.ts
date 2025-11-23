import { Howl, Howler } from 'howler';
import { SOUNDS } from './constants';
import { useAppStore } from './store';

// Audio manager singleton
class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  private initialized = false;

  constructor() {
    // Set global volume
    Howler.volume(0.7);
  }

  // Initialize all sound effects
  init() {
    if (this.initialized) return;

    // Load UI sounds
    this.sounds.set(
      'hover',
      new Howl({
        src: [SOUNDS.hover],
        volume: 0.3,
        preload: true,
      })
    );

    this.sounds.set(
      'click',
      new Howl({
        src: [SOUNDS.click],
        volume: 0.4,
        preload: true,
      })
    );

    this.sounds.set(
      'whoosh',
      new Howl({
        src: [SOUNDS.whoosh],
        volume: 0.3,
        preload: true,
      })
    );

    this.sounds.set(
      'splash',
      new Howl({
        src: [SOUNDS.splash],
        volume: 0.5,
        preload: true,
      })
    );

    this.sounds.set(
      'chime',
      new Howl({
        src: [SOUNDS.chime],
        volume: 0.4,
        preload: true,
      })
    );

    this.initialized = true;
  }

  // Play a sound effect
  play(soundName: 'hover' | 'click' | 'whoosh' | 'splash' | 'chime') {
    const { settings } = useAppStore.getState();
    if (!settings.audioEnabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // Create a new instance for overlapping sounds
      const id = sound.play();
      return id;
    }
  }

  // Stop a specific sound
  stop(soundName: string, id?: number) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      if (id !== undefined) {
        sound.stop(id);
      } else {
        sound.stop();
      }
    }
  }

  // Load and play background music
  loadMusic(src: string) {
    if (this.music) {
      this.music.unload();
    }

    this.music = new Howl({
      src: [src],
      html5: true, // Use HTML5 Audio for streaming
      loop: true,
      volume: 0.5,
      onload: () => {
        console.log('Music loaded');
      },
      onloaderror: (_id, error) => {
        console.error('Error loading music:', error);
      },
    });

    return this.music;
  }

  // Play music
  playMusic() {
    const { settings } = useAppStore.getState();
    if (!settings.audioEnabled) return;

    if (this.music && !this.music.playing()) {
      this.music.play();
      useAppStore.getState().setIsPlaying(true);
    }
  }

  // Pause music
  pauseMusic() {
    if (this.music) {
      this.music.pause();
      useAppStore.getState().setIsPlaying(false);
    }
  }

  // Toggle music
  toggleMusic() {
    if (this.music) {
      if (this.music.playing()) {
        this.pauseMusic();
      } else {
        this.playMusic();
      }
    }
  }

  // Get music instance for visualization
  getMusic() {
    return this.music;
  }

  // Set music seek position
  seekMusic(position: number) {
    if (this.music) {
      this.music.seek(position);
    }
  }

  // Get current music position
  getMusicPosition(): number {
    if (this.music) {
      return this.music.seek() as number;
    }
    return 0;
  }

  // Get music duration
  getMusicDuration(): number {
    if (this.music) {
      return this.music.duration();
    }
    return 0;
  }

  // Set global volume
  setVolume(volume: number) {
    Howler.volume(volume);
    useAppStore.getState().setVolume(volume);
  }

  // Get global volume
  getVolume(): number {
    return Howler.volume();
  }

  // Mute all sounds
  mute(muted: boolean) {
    Howler.mute(muted);
  }

  // Clean up
  destroy() {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();

    if (this.music) {
      this.music.unload();
      this.music = null;
    }

    this.initialized = false;
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Convenience functions
export const playSound = (sound: 'hover' | 'click' | 'whoosh' | 'splash' | 'chime') => {
  audioManager.play(sound);
};

export const playHover = () => playSound('hover');
export const playClick = () => playSound('click');
export const playWhoosh = () => playSound('whoosh');
export const playSplash = () => playSound('splash');
export const playChime = () => playSound('chime');

// Beat detection for music visualization
export class BeatDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dataArray: any = null;
  private previousEnergy: number = 0;
  private beatThreshold: number = 1.5;

  init(audioElement: HTMLAudioElement) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  // Get frequency data for visualization
  getFrequencyData(): Uint8Array | null {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return null;
  }

  // Detect if there's a beat
  detectBeat(): boolean {
    if (!this.analyser || !this.dataArray) return false;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average energy in low frequencies (bass)
    let energy = 0;
    const bassRange = Math.floor(this.dataArray.length * 0.1); // First 10% (bass frequencies)

    for (let i = 0; i < bassRange; i++) {
      energy += this.dataArray[i];
    }
    energy /= bassRange;

    // Detect beat as sudden increase in energy
    const isBeat = energy > this.previousEnergy * this.beatThreshold && energy > 100;

    this.previousEnergy = energy * 0.9 + this.previousEnergy * 0.1; // Smooth decay

    return isBeat;
  }

  // Get normalized frequency bands for visualization
  getFrequencyBands(numBands: number = 8): number[] {
    if (!this.analyser || !this.dataArray) {
      return new Array(numBands).fill(0);
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const bands: number[] = [];
    const bandSize = Math.floor(this.dataArray.length / numBands);

    for (let i = 0; i < numBands; i++) {
      let sum = 0;
      for (let j = 0; j < bandSize; j++) {
        sum += this.dataArray[i * bandSize + j];
      }
      bands.push(sum / bandSize / 255); // Normalize to 0-1
    }

    return bands;
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
    }
  }
}
