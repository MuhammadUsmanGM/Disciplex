import { GOLD, RED, TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY } from '@/constants/theme';
import { FeatureIcons } from '@/src/utils/icons';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TypewriterText } from './TypewriterText';

interface DebtReconciliationProps {
  debt: number;
  consecutiveHighDays: number;
}

export function DebtReconciliation({ debt, consecutiveHighDays }: DebtReconciliationProps) {
  if (debt <= 0) return null;

  const progress = Math.min(100, (consecutiveHighDays / 2) * 100);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <FeatureIcons.Alert size={16} color={RED} />
        <Text style={styles.title}>PROTOCOL REDEMPTION ACTIVE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.debtBlock}>
          <Text style={styles.debtLabel}>OUTSTANDING DEBT</Text>
          <Text style={styles.debtValue}>{Math.round(debt)}.00 UNIT</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.requirementBlock}>
          <TypewriterText 
            text="REQUIRED: 2 CONSECUTIVE DAYS AT >85% ACCURACY TO RESET IDENTITY INTEGRITY."
            speed={20}
            style={styles.requirementText}
          />
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>RECOVERY STATUS</Text>
              <Text style={styles.progressValue}>{consecutiveHighDays}/2 DAYS</Text>
            </View>
            <View style={styles.track}>
              <MotiView 
                from={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 1000 }}
                style={[styles.fill, { backgroundColor: progress >= 100 ? GOLD : RED }]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerScanner}>SCANNING FOR ALIGNMENT SPIKES...</Text>
      </View>
      
      {/* Scanning Line Animation */}
      <MotiView
        from={{ translateY: 0 }}
        animate={{ translateY: 150 }}
        transition={{ type: 'timing', duration: 3000, loop: true }}
        style={styles.scannerLine}
      />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(204, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(204, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: RED,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'ui-monospace',
  },
  content: {
    gap: 16,
  },
  debtBlock: {
    alignItems: 'flex-start',
  },
  debtLabel: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'ui-monospace',
  },
  debtValue: {
    color: RED,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
    width: '100%',
  },
  requirementBlock: {
    gap: 12,
  },
  requirementText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontFamily: 'ui-monospace',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontWeight: '800',
    fontFamily: 'ui-monospace',
  },
  progressValue: {
    color: TEXT_PRIMARY,
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerScanner: {
    color: 'rgba(204, 0, 0, 0.4)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(204, 0, 0, 0.3)',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 10,
  },
});
