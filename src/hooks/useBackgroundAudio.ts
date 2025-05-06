import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';

export const useBackgroundAudio = (volume: number) => {
  const soundRef = useRef<Howl | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize sound
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/sounds/ambient.mp3'],
      volume: volume * 0.3, // Background music is always quieter than effects
      loop: true,
      preload: true,
      html5: true
    });

    // Start playing with a fade in
    soundRef.current.fade(0, volume * 0.3, 2000);
    soundRef.current.play();

    // Cleanup on unmount
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (soundRef.current) {
        soundRef.current.fade(soundRef.current.volume(), 0, 1000);
        setTimeout(() => soundRef.current?.unload(), 1000);
      }
    };
  }, []); // Only initialize once

  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current) {
      const targetVolume = volume * 0.3; // Keep background at 30% of effect volume
      soundRef.current.fade(soundRef.current.volume(), targetVolume, 500);
    }
  }, [volume]);

  const toggleMute = useCallback(() => {
    if (!soundRef.current) return;

    if (soundRef.current.volume() > 0) {
      // Fade out
      soundRef.current.fade(soundRef.current.volume(), 0, 500);
    } else {
      // Fade in
      soundRef.current.fade(0, volume * 0.3, 500);
    }
  }, [volume]);

  return { toggleMute };
}; 