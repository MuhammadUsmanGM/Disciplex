import { BASE, GLOW_GOLD } from '@/constants/theme';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

export function LiveBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: BASE, overflow: 'hidden' }]}>
      {/* Orb 1: Gold Performance Glow */}
      <MotiView
        from={{ translateX: -100, translateY: -100, scale: 1 }}
        animate={{ 
          translateX: width * 0.7, 
          translateY: height * 0.2,
          scale: 1.5
        }}
        transition={{
          type: 'timing',
          duration: 15000,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.orb, { 
          width: 300, 
          height: 300, 
          backgroundColor: GLOW_GOLD,
          top: 0,
          left: 0,
        }]}
      />

      {/* Orb 2: Red Consequence Glow */}
      <MotiView
        from={{ translateX: width, translateY: height, scale: 1 }}
        animate={{ 
          translateX: width * 0.1, 
          translateY: height * 0.6,
          scale: 1.2
        }}
        transition={{
          type: 'timing',
          duration: 20000,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.orb, { 
          width: 400, 
          height: 400, 
          backgroundColor: 'rgba(204, 0, 0, 0.05)',
          bottom: 0,
          right: 0,
        }]}
      />

      {/* Subtle Scanline / Noise Overlay for texture */}
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.4,
    filter: 'blur(80px)', // Note: standard RN doesn't support filter, but many templates do. Using blur as fallback.
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  }
});
