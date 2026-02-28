import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

// Tactical UI sound URLs (High-quality CDN assets)
const SOUND_ASSETS = {
  CHECK: 'https://cdn.pixabay.com/audio/2022/03/15/audio_732230485a.mp3', // Sharp mechanical click
  UNCHECK: 'https://cdn.pixabay.com/audio/2022/03/15/audio_24e393b5a7.mp3', // Soft unlatch
  ALERT: 'https://cdn.pixabay.com/audio/2022/10/24/audio_34b655f46a.mp3', // Dissonant system warning
  TYPEWRITER: 'https://cdn.pixabay.com/audio/2022/03/10/audio_f542167d46.mp3', // Mechanical print chirp
  COMPLETE: 'https://cdn.pixabay.com/audio/2022/03/15/audio_4a44b9ffdc.mp3', // High-end pulse
};

type SoundType = keyof typeof SOUND_ASSETS;

export function useSound() {
  const [sounds, setSounds] = useState<Record<string, Audio.Sound>>({});

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      Object.values(sounds).forEach(sound => {
        sound.unloadAsync();
      });
    };
  }, [sounds]);

  const playSound = async (type: SoundType, volume: number = 0.5) => {
    try {
      // If sound already loaded, reset and play
      if (sounds[type]) {
        await sounds[type].replayAsync();
        return;
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_ASSETS[type] },
        { shouldPlay: true, volume }
      );
      
      setSounds(prev => ({ ...prev, [type]: sound }));
    } catch (error) {
       // Silently fail to not break UI flow
       console.log('Audio protocol failure:', error);
    }
  };

  return { playSound };
}
