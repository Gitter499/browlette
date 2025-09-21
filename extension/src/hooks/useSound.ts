import { useCallback } from 'react';

// Sound files should be placed in the public directory
const sounds = {
  click: '/sounds/click.mp3',
  join: '/sounds/join.mp3',
  reveal: '/sounds/reveal.mp3',
};

export const useSound = () => {
  const playSound = useCallback((sound: keyof typeof sounds) => {
    const audio = new Audio(sounds[sound]);
    audio.play().catch(error => console.error('Error playing sound:', error));
  }, []);

  return playSound;
};
