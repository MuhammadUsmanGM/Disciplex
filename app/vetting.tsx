/**
 * Identity Vetting Protocol
 * Security Screening V.01
 */

import {
    GOLD,
    GOLD_SUBTLE,
    RED,
    TEXT_MUTED,
    TEXT_PRIMARY
} from '@/constants/theme';
import { TypewriterText } from '@/src/components/ui/TypewriterText';
import { useSound } from '@/src/hooks/useSound';
import { ActionIcons } from '@/src/utils/icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function VettingScreen() {
  const router = useRouter();
  const { playSound } = useSound();
  const [isVetting, setIsVetting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [status, setStatus] = useState('SYSTEM_LOCKED');

  // Scanning loop sound
  useEffect(() => {
    let interval: any;
    if (isVetting && !isConfirmed) {
      interval = setInterval(() => {
        playSound('SCAN', 0.1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 300);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVetting, isConfirmed, playSound]);

  // Handle progress
  useEffect(() => {
    let interval: any;
    if (isVetting && progress < 100) {
      interval = setInterval(() => {
        setProgress((p) => {
          const next = p + 2;
          if (next >= 100) {
             clearInterval(interval);
             handleDiscovery();
             return 100;
          }
          return next;
        });
      }, 40);
    } else if (!isVetting && progress < 100) {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isVetting]);

  const handleDiscovery = useCallback(() => {
    setIsConfirmed(true);
    setStatus('IDENTITY_VERIFIED');
    playSound('ACCESS', 0.6);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Auto transition to dashboard
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1500);
  }, [playSound, router]);

  const onStartVetting = () => {
    if (isConfirmed) return;
    setIsVetting(true);
    setStatus('VETTING_IDENTITY...');
  };

  const onStopVetting = () => {
    if (isConfirmed) return;
    setIsVetting(false);
    setProgress(0);
    setStatus('SYSTEM_LOCKED');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        {/* Header Terminal Info */}
        <View style={styles.terminalHeader}>
          <Text style={styles.serialNumber}>PROTO_SEC_V.01 // {new Date().getFullYear()}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, isConfirmed ? styles.statusConfirmed : isVetting ? styles.statusVetting : null]} />
            <Text style={[styles.statusText, isConfirmed ? styles.statusConfirmedText : null]}>{status}</Text>
          </View>
        </View>

        {/* Scan Matrix */}
        <View style={styles.scanMatrix}>
          {/* Decorative Rings */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.ringOuter}
          />
          <MotiView
             animate={{ rotate: '360deg' }}
             transition={{ type: 'timing', duration: 10000, loop: true, repeatReverse: false }}
             style={styles.ringInner}
          >
             <View style={styles.ringNotch} />
          </MotiView>

          {/* Scanner Area */}
          <Pressable
            onPressIn={onStartVetting}
            onPressOut={onStopVetting}
            style={({ pressed }) => [
              styles.scanTarget,
              pressed && styles.scanTargetPressed,
              isConfirmed && styles.scanTargetConfirmed,
            ]}
          >
            <MotiView
              animate={{ 
                 scale: isVetting ? [1, 1.1, 1] : 1,
                 opacity: isVetting ? 1 : 0.7
              }}
              transition={{ type: 'timing', duration: 800, loop: true }}
            >
              {isConfirmed ? (
                <ActionIcons.Check size={48} color={GOLD} />
              ) : (
                <ActionIcons.Fingerprint size={48} color={isVetting ? GOLD : TEXT_MUTED} />
              )}
            </MotiView>

            {/* Progress track */}
            <View style={styles.progressTrack}>
               <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Sweep Line Animation */}
            {isVetting && !isConfirmed && (
              <MotiView
                from={{ translateY: -80 }}
                animate={{ translateY: 80 }}
                transition={{ type: 'timing', duration: 1500, loop: true }}
                style={styles.sweepLine}
              />
            )}
          </Pressable>
        </View>

        {/* Diagnostic Text */}
        <View style={styles.diagnostic}>
          <AnimatePresence>
            {!isConfirmed ? (
               <MotiView 
                 key="vet_text"
                 from={{ opacity: 0, translateY: 10 }}
                 animate={{ opacity: 1, translateY: 0 }}
                 exit={{ opacity: 0, translateY: -10 }}
                 style={{ alignItems: 'center' }}
               >
                 <Text style={styles.instruction}>HOLD TO AUTHENTICATE BEHAVIORAL OS</Text>
                 <Text style={styles.subInstruction}>BIO_METRIC_VETTING_ACTIVE</Text>
               </MotiView>
            ) : (
               <MotiView 
                 key="conf_text"
                 from={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 style={{ alignItems: 'center' }}
               >
                  <TypewriterText 
                    text="WELCOME_BACK_COMMANDER"
                    speed={30}
                    style={styles.welcomeText}
                  />
                  <Text style={styles.accessText}>LEVEL_1_CLEARANCE_DISCOVERY_COMPLETE</Text>
               </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* Footer Hardware Tag */}
        <View style={styles.footer}>
           <Text style={styles.hardwareTag}>DISCIPLEX_HARDWARE_INTERFACE</Text>
           <View style={styles.hardwareGrid}>
              {[1,2,3,4,5].map(i => (
                <View key={i} style={styles.gridDot} />
              ))}
           </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terminalHeader: {
    width: '100%',
    paddingTop: 40,
  },
  serialNumber: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  statusVetting: {
    backgroundColor: GOLD,
  },
  statusConfirmed: {
    backgroundColor: '#2A7A4B',
  },
  statusText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
    letterSpacing: 2,
  },
  statusConfirmedText: {
    color: '#2A7A4B',
  },

  // Matrix
  scanMatrix: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringOuter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  ringInner: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(201, 168, 76, 0.1)',
  },
  ringNotch: {
    position: 'absolute',
    top: -5,
    left: '50%',
    width: 20,
    height: 10,
    backgroundColor: GOLD,
    opacity: 0.3,
    borderRadius: 2,
  },

  // Target
  scanTarget: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
  },
  scanTargetPressed: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
    shadowOpacity: 0.2,
  },
  scanTargetConfirmed: {
    borderColor: '#2A7A4B',
    backgroundColor: 'rgba(42, 122, 75, 0.1)',
  },
  sweepLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 10,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 30,
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
  },

  // Diagnostic
  diagnostic: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subInstruction: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  welcomeText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 4,
    marginBottom: 8,
  },
  accessText: {
    color: '#2A7A4B',
    fontSize: 8,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Footer
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  hardwareTag: {
    color: TEXT_MUTED,
    fontSize: 7,
    fontFamily: 'ui-monospace',
    letterSpacing: 3,
    marginBottom: 12,
  },
  hardwareGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridDot: {
    width: 2,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  }
});
