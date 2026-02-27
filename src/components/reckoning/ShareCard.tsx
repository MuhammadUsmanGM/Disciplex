import * as Sharing from 'expo-sharing';
import React, { ReactNode, useRef } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { getScoreColor } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface ShareCardProps {
  score: number;
  verdictExcerpt?: string;
  children?: ReactNode; // A button or trigger to initiate sharing
}

export function ShareCardWrapper({ score, verdictExcerpt, children }: ShareCardProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const getAlignmentLabel = (s: number) => {
    if (s >= 75) return 'ALIGNED';
    if (s >= 50) return 'DRIFTING';
    return 'IDENTITY GAP';
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      if (!viewShotRef.current?.capture) {
        throw new Error("Capture method not available");
      }

      // Capture the absolute stark view
      const uri = await viewShotRef.current.capture();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Identity Alignment',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      }
    } catch (error) {
      console.error('Error capturing and sharing image:', error);
      Alert.alert('Error', 'Failed to generate share card.');
    }
  };

  const color = getScoreColor(score);
  const label = getAlignmentLabel(score);

  return (
    <View style={styles.wrapper}>
      {/* 
        This is the actual view that gets captured. 
        It is rendered off-screen (position absolute, left negative) to avoid disrupting UI, 
        or it can be rendered invisibly. 
      */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.offscreen}
      >
        <View style={styles.card}>
          <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
          <Text style={[styles.label, { color }]}>{label}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.verdict}>
            {verdictExcerpt || "Identity claim tested. Data logged."}
          </Text>

          {/* Simple Wordmark representation instead of relying on local image resolution */}
          <Text style={styles.wordmark}>DISCIPLEX</Text>
        </View>
      </ViewShot>

      {/* Trigger button provided by parent */}
      <Pressable onPress={handleShare}>
        {children || (
          <View style={styles.defaultTrigger}>
            <Text style={styles.defaultTriggerText}>Share Card</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Parent should handle positioning of the trigger
  },
  offscreen: {
    position: 'absolute',
    left: -10000, // Rendered completely off-screen
    top: 0,
    width: 600, // Fixed width for high-quality capture
    backgroundColor: '#050505', // Deep black
  },
  card: {
    width: 600,
    backgroundColor: '#050505',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  score: {
    fontSize: 220,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    letterSpacing: -10,
    lineHeight: 240,
    marginBottom: 0,
  },
  label: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 10,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 60,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: '#333333',
    marginBottom: 60,
  },
  verdict: {
    color: '#888888',
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  wordmark: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 6,
    fontFamily: 'ui-monospace',
  },
  defaultTrigger: {
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  defaultTriggerText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
  }
});
