/**
 * ShareCard Component
 * Generates shareable score cards with haptic feedback
 * 
 * Free Tier: 1 share per month
 * Pro Tier: Unlimited shares
 */

import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { getScoreColor } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const SHARE_LIMIT_KEY = 'disciplex_share_count';
const SHARE_TIMESTAMP_KEY = 'disciplex_share_timestamp';
const FREE_TIER_LIMIT = 1; // 1 share per month for free users

interface ShareCardProps {
  score: number;
  verdictExcerpt?: string;
  children?: ReactNode;
  isPro?: boolean; // Pass subscription status
}

export function ShareCardWrapper({ score, verdictExcerpt, children, isPro = false }: ShareCardProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [checking, setChecking] = useState(false);

  const getAlignmentLabel = (s: number) => {
    if (s >= 75) return 'ALIGNED';
    if (s >= 50) return 'DRIFTING';
    return 'IDENTITY GAP';
  };

  const checkShareLimit = async (): Promise<boolean> => {
    if (isPro) return true;

    try {
      const timestamp = await AsyncStorage.getItem(SHARE_TIMESTAMP_KEY);
      const count = await AsyncStorage.getItem(SHARE_LIMIT_KEY);
      
      const now = Date.now();
      const monthMs = 30 * 24 * 60 * 60 * 1000;
      
      if (!timestamp || now - parseInt(timestamp) > monthMs) {
        await AsyncStorage.setItem(SHARE_TIMESTAMP_KEY, now.toString());
        await AsyncStorage.setItem(SHARE_LIMIT_KEY, '0');
        return true;
      }

      const shareCount = parseInt(count || '0');
      return shareCount < FREE_TIER_LIMIT;
    } catch (error) {
      console.error('Error checking share limit:', error);
      return true;
    }
  };

  const incrementShareCount = async () => {
    if (isPro) return;

    try {
      const count = await AsyncStorage.getItem(SHARE_LIMIT_KEY);
      const newCount = (parseInt(count || '0') + 1).toString();
      await AsyncStorage.setItem(SHARE_LIMIT_KEY, newCount);
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  };

  const handleShare = async () => {
    setChecking(true);
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const canShare = await checkShareLimit();
      
      if (!canShare) {
        Alert.alert(
          'Share Limit Reached',
          `Free tier: ${FREE_TIER_LIMIT} share per month.\n\nUpgrade to Pro for unlimited shares.`,
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Upgrade to Pro', onPress: () => {} },
          ]
        );
        setChecking(false);
        return;
      }

      if (!viewShotRef.current?.capture) {
        throw new Error("Capture method not available");
      }

      const uri = await viewShotRef.current.capture();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Identity Alignment',
        });
        
        await incrementShareCount();
      } else {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      }
    } catch (error) {
      console.error('Error capturing and sharing image:', error);
      Alert.alert('Error', 'Failed to generate share card.');
    } finally {
      setChecking(false);
    }
  };

  const color = getScoreColor(score);
  const label = getAlignmentLabel(score);

  return (
    <View style={styles.wrapper}>
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

          <Text style={styles.wordmark}>DISCIPLEX</Text>
        </View>
      </ViewShot>

      <Pressable onPress={handleShare} disabled={checking}>
        {children || (
          <View style={[styles.defaultTrigger, checking && styles.defaultTriggerDisabled]}>
            <Text style={styles.defaultTriggerText}>
              {checking ? '...' : 'Share Card'}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
  },
  offscreen: {
    position: 'absolute',
    left: -10000,
    top: 0,
    width: 600,
    backgroundColor: '#050505',
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
  defaultTriggerDisabled: {
    opacity: 0.5,
  },
  defaultTriggerText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
  }
});
