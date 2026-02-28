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
            {/* Corner Markers */}
            <View style={[styles.corner, { top: 40, left: 40, borderTopWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { top: 40, right: 40, borderTopWidth: 2, borderRightWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 40, left: 40, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 40, right: 40, borderBottomWidth: 2, borderRightWidth: 2 }]} />

            <View style={styles.recordHeader}>
              <Text style={styles.recordId}>RECORD ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
              <Text style={styles.recordId}>{new Date().toISOString().split('T')[0]}</Text>
            </View>

            <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
            <Text style={[styles.label, { color }]}>{label}</Text>

            <View style={styles.divider} />

            <Text style={styles.verdict}>
              {verdictExcerpt || "Identity claim tested. Behavioral alignment confirmed. System log entry persistent."}
            </Text>

            <View style={styles.footer}>
              <View style={styles.footerLine} />
              <Text style={styles.wordmark}>DISCIPLEX OS // PERFORMANCE REPORT</Text>
              <View style={styles.footerLine} />
            </View>
          </View>
        </ViewShot>
      </View>

      <Pressable onPress={handleShare} disabled={checking}>
        {children || (
          <View style={[styles.defaultTrigger, checking && styles.defaultTriggerDisabled]}>
            <Text style={styles.defaultTriggerText}>
              {checking ? 'GENERATING...' : 'EXPORT PROOF OF EXECUTION'}
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
    left: -20000,
    top: 0,
    width: 600,
    height: 800,
    backgroundColor: '#050505',
  },
  card: {
    width: 600,
    height: 800,
    backgroundColor: '#050505',
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 80,
    paddingHorizontal: 80,
  },
  recordId: {
    color: '#333333',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
  },
  score: {
    fontSize: 240,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: -12,
    lineHeight: 240,
    marginBottom: 0,
  },
  label: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 12,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 60,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 60,
  },
  verdict: {
    color: '#888888',
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 80,
    paddingHorizontal: 40,
    fontFamily: 'ui-monospace',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  footerLine: {
    width: 100,
    height: 1,
    backgroundColor: '#1A1A1A',
    marginVertical: 10,
  },
  wordmark: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: 'ui-monospace',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#1A1A1A',
  },
  defaultTrigger: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9A84C',
    alignItems: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  defaultTriggerDisabled: {
    opacity: 0.5,
  },
  defaultTriggerText: {
    color: '#C9A84C',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'ui-monospace',
  }
});
