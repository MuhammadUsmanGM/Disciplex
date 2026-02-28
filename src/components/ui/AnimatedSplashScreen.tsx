import { BASE, GOLD } from '@/constants/theme';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

const { width } = Dimensions.get('window');

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // Stage 1: Initial Pulse
    const t1 = setTimeout(() => setPhase(1), 800);
    // Stage 2: Logo Reveal
    const t2 = setTimeout(() => setPhase(2), 2200);
    // Stage 3: Shutdown/Handover
    const t3 = setTimeout(() => setPhase(3), 3600);
    // Completion
    const t4 = setTimeout(() => onAnimationComplete(), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAnimationComplete]);

  return (
    <View style={styles.container}>
      {/* Background Grid Lines (Static for Splash) */}
      <View style={styles.gridOverlay}>
        <View style={styles.verticalLine} />
        <View style={styles.horizontalLine} />
      </View>

      <MotiView
        animate={{ opacity: phase === 3 ? 0 : 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.content}
      >
        {phase >= 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: phase >= 2 ? 0 : 1, 
              scale: phase === 1 ? 1.1 : 1 
            }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Image
              source={require('@/assets/images/favicon.png')}
              style={styles.icon}
            />
          </MotiView>
        )}

        {phase >= 1 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.textContainer}
          >
            <Text style={styles.title}>DISCIPLEX</Text>
            <Text style={styles.subtitle}>ESTABLISHING PROTOCOL...</Text>
            
            {/* Loading Bar */}
            <View style={styles.loaderBg}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: phase >= 2 ? '100%' : '40%' }}
                transition={{ type: 'timing', duration: 2500 }}
                style={styles.loaderFill}
              />
            </View>
          </MotiView>
        )}
      </MotiView>

      {/* Aesthetic corner markers */}
      <View style={[styles.corner, { top: 60, left: 30, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, { top: 60, right: 30, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View style={[styles.corner, { bottom: 60, left: 30, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, { bottom: 60, right: 30, borderBottomWidth: 1, borderRightWidth: 1 }]} />
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
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 10,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: 'ui-monospace',
    marginBottom: 24,
  },
  loaderBg: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: GOLD,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
});
