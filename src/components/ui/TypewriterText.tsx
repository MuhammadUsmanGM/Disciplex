import { useSound } from '@/src/hooks/useSound';
import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  delay = 0,
  speed = 30,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        const char = text.charAt(currentIndex);
        setDisplayedText((prev) => prev + char);
        
        // Play sound every few chars for tactical feel (not every char to avoid noise)
        if (currentIndex % 3 === 0 && char !== ' ') {
          playSound('TYPEWRITER', 0.2);
        }
        
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed, onComplete, playSound]);

  return <Text style={style}>{displayedText}</Text>;
}
