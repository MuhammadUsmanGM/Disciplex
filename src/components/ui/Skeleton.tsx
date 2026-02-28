/**
 * Skeleton Loading Components
 * Placeholder UI for loading states
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';

import { BASE, BORDER, SURFACE } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  delay?: number;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  delay = 0,
}: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.3 }}
      transition={{
        type: 'timing',
        duration: 1000,
        delay,
        loop: true,
      }}
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
      ]}
    />
  );
}

interface SkeletonCardProps {
  delay?: number;
}

export function SkeletonCard({ delay = 0 }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      <Skeleton width="40%" height={14} borderRadius={4} delay={delay} />
      <Skeleton width="90%" height={40} borderRadius={8} delay={delay + 100} />
      <View style={styles.cardFooter}>
        <Skeleton width="30%" height={12} borderRadius={4} delay={delay + 200} />
      </View>
    </View>
  );
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lastLineWidth?: string | number;
}) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={12}
          borderRadius={4}
          delay={i * 100}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  textContainer: {
    gap: 8,
  },
});
