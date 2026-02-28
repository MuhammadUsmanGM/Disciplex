import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { BASE } from '@/constants/theme';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

const { width } = Dimensions.get('window');

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Reveal Icon Component
    const t1 = setTimeout(() => {
      setPhase(1); // Switch to full logo
    }, 1800);

    // Fade out everything
    const t2 = setTimeout(() => {
      setPhase(2); 
    }, 3200);

    // Unmount and hand over to app
    const t3 = setTimeout(() => {
      onAnimationComplete();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onAnimationComplete]);

  return (
    <View style={styles.container}>
      <MotiView
        style={styles.imageContainer}
        animate={{ opacity: phase === 2 ? 0 : 1 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        {phase === 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.5, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100,
            }}
            exit={{ opacity: 0, scale: 1.1 }}
            exitTransition={{
              type: 'timing',
              duration: 400,
            }}
          >
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.icon}
            />
          </MotiView>
        )}

        {phase === 1 && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 800,
            }}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
            />
          </MotiView>
        )}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BASE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  icon: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'contain',
  },
  logo: {
    width: width * 0.55,
    height: width * 0.2, // scaled proportionally to 240x80 roughly
    resizeMode: 'contain',
  },
});
