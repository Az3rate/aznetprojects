import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';

export const useTypingSound = (volume: number) => {
  const soundRef = useRef<Howl | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const MIN_PLAY_INTERVAL = 25; 


  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/sounds/keypress.wav'],
      volume: volume,
      preload: true,
      html5: true,
      pool: 5 
    });


    return () => {
      soundRef.current?.unload();
    };
  }, [volume]); 

  const playTypingSound = useCallback(() => {
    const now = Date.now();
    

    if (now - lastPlayTimeRef.current < MIN_PLAY_INTERVAL) {
      return;
    }

    if (!soundRef.current) return;


    const pitch = 0.85 + Math.random() * 0.3; 
    const volumeVariation = 0.12 + Math.random() * 0.08; 
    

    if (Math.random() < 0.1) {
      return;
    }


    if (Math.random() < 0.2) {
      setTimeout(() => {
        soundRef.current?.rate(pitch);
        soundRef.current?.volume(volume * volumeVariation);
        soundRef.current?.play();
      }, Math.random() * 15); 
    } else {
      soundRef.current.rate(pitch);
      soundRef.current.volume(volume * volumeVariation);
      soundRef.current.play();
    }

    lastPlayTimeRef.current = now;
  }, [volume]);

  return playTypingSound;
}; 