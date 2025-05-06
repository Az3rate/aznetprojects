import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';

export const useTypingSound = (volume: number) => {
  const soundRef = useRef<Howl | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const MIN_PLAY_INTERVAL = 25; // Slightly faster for more natural typing

  // Initialize sound
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/sounds/keypress.wav'],
      volume: volume,
      preload: true,
      html5: true,
      pool: 5 // Create a pool of 5 sounds for overlapping playback
    });

    // Cleanup on unmount
    return () => {
      soundRef.current?.unload();
    };
  }, [volume]); // Reinitialize when volume changes

  const playTypingSound = useCallback(() => {
    const now = Date.now();
    
    // Prevent sounds from playing too close together
    if (now - lastPlayTimeRef.current < MIN_PLAY_INTERVAL) {
      return;
    }

    if (!soundRef.current) return;

    // More sophisticated randomization for natural variation
    const pitch = 0.85 + Math.random() * 0.3; // Wider pitch range (0.85 to 1.15)
    const volumeVariation = 0.12 + Math.random() * 0.08; // Slight volume variation (0.12 to 0.20)
    
    // Randomly skip some keystrokes (10% chance) to simulate missed keys
    if (Math.random() < 0.1) {
      return;
    }

    // Occasionally add a slight delay (20% chance) to simulate typing rhythm
    if (Math.random() < 0.2) {
      setTimeout(() => {
        soundRef.current?.rate(pitch);
        soundRef.current?.volume(volume * volumeVariation);
        soundRef.current?.play();
      }, Math.random() * 15); // Random delay up to 15ms
    } else {
      soundRef.current.rate(pitch);
      soundRef.current.volume(volume * volumeVariation);
      soundRef.current.play();
    }

    // Update last play time
    lastPlayTimeRef.current = now;
  }, [volume]);

  return playTypingSound;
}; 