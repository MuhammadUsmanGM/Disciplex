import { GOLD, RED, TEXT_MUTED, TEXT_PRIMARY } from '@/constants/theme';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface IdentityIntegrityProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function IdentityIntegrity({
  score,
  size = 140,
  strokeWidth = 8,
}: IdentityIntegrityProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const color = score >= 75 ? GOLD : score >= 50 ? TEXT_PRIMARY : RED;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Path */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.textBlock}
        >
          <Text style={[styles.scoreText, { color }]}>{Math.round(score)}%</Text>
          <Text style={styles.label}>INTEGRITY</Text>
        </MotiView>
      </View>
      
      {/* Decorative pulse when stable */}
      {score >= 75 && (
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.2 }}
          transition={{ type: 'timing', duration: 2000, loop: true }}
          style={[styles.pulseCircle, { width: size, height: size, borderColor: GOLD }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: -1,
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -2,
    fontFamily: 'ui-monospace',
  },
  pulseCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1,
  },
});
