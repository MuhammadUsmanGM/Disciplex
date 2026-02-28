import { BASE, GOLD_SUBTLE_2, RED_SUBTLE_2 } from '@/constants/theme';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function LiveBackground() {
  const { width, height } = useWindowDimensions();

  // Generate grid lines
  const horizontalLines = useMemo(() => Array.from({ length: 25 }), []);
  const verticalLines = useMemo(() => Array.from({ length: 15 }), []);

  return (
    <View style={styles.container}>
      {/* Base Layer */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BASE }]} />

      {/* Primary Glow Orb (Top Right) */}
      <MotiView
        from={{ scale: 0.8, opacity: 0.2, translateX: width * 0.5, translateY: -100 }}
        animate={{ 
          scale: 1.5, 
          opacity: 0.5,
          translateX: width * 0.2,
          translateY: 100
        }}
        transition={{
          type: 'timing',
          duration: 20000,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.orb, { width: 500, height: 500, backgroundColor: GOLD_SUBTLE_2 }]}
      />

      {/* Secondary Glow Orb (Bottom Left) */}
      <MotiView
        from={{ scale: 1.2, opacity: 0.1, translateX: -200, translateY: height }}
        animate={{ 
          scale: 0.8, 
          opacity: 0.3,
          translateX: 100,
          translateY: height * 0.6
        }}
        transition={{
          type: 'timing',
          duration: 25000,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.orb, { width: 600, height: 600, backgroundColor: RED_SUBTLE_2 }]}
      />

      {/* Moving Grid System */}
      <MotiView
        animate={{ translateY: -40 }}
        transition={{
          type: 'timing',
          duration: 5000,
          loop: true,
          repeatReverse: false,
          easing: (t) => t, // Truly linear
        }}
        style={styles.gridContainer}
        pointerEvents="none"
      >
        {horizontalLines.map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 40 }]} />
        ))}
        {verticalLines.map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: (width / 14) * i }]} />
        ))}
      </MotiView>

      {/* Scanline Effect Layer */}
      <View style={styles.scanlineOverlay} pointerEvents="none" />
      
      {/* Radial Vignette Overlay for Depth */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={BASE} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={BASE} stopOpacity="0" />
            <Stop offset="100%" stopColor={BASE} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BASE,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 300,
    filter: 'blur(100px)', // For platforms that support it
    opacity: 0.5,
  },
  gridContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    bottom: -40,
    opacity: 0.15,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.2)',
  },
});
