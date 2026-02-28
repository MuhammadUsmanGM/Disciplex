import { GOLD, RED, SHADOWS, TEXT_PRIMARY, TEXT_SECONDARY } from '@/constants/theme';
import { ReckoningResult } from '@/src/types/reckoning';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TypewriterText } from '../ui/TypewriterText';

interface ReckoningCardProps {
  reckoning: ReckoningResult;
  weekScore: number;
  trend: number;
  date?: string;
}

export function ReckoningCard({ reckoning, weekScore, trend, date }: ReckoningCardProps) {
  const [verdictComplete, setVerdictComplete] = useState(false);
  const [bottleneckComplete, setBottleneckComplete] = useState(false);

  const weekLabel = date || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <MotiView 
       from={{ opacity: 0, scale: 0.98, translateY: 10 }}
       animate={{ opacity: 1, scale: 1, translateY: 0 }}
       transition={{ type: 'timing', duration: 600 }}
       style={[styles.container, weekScore >= 75 && SHADOWS.goldGlow]}
    >
      {/* Dynamic Scanline Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>IDENTITY PERFORMANCE ANALYST</Text>
          <Text style={styles.subtitle}>PROTOCOL: WEK-RECK-01</Text>
        </View>
        <Text style={styles.date}>{weekLabel}</Text>
      </View>

      {/* Primary Stats Panel */}
      <View style={styles.statsGrid}>
        <MotiView 
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          style={[styles.statBox, { borderLeftWidth: 2, borderLeftColor: getScoreColor(weekScore) }]}
        >
          <Text style={styles.statLabel}>ALIGNMENT SCORE</Text>
          <Text style={[styles.statValue, { color: getScoreColor(weekScore) }]}>
            {Math.round(weekScore)}%
          </Text>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, translateX: 10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
          style={[styles.statBox, { borderLeftWidth: 2, borderLeftColor: trend >= 0 ? GOLD : RED }]}
        >
          <Text style={styles.statLabel}>VECTORS / TREND</Text>
          <Text style={[styles.statValue, { color: trend >= 0 ? GOLD : RED }]}>
            {trend >= 0 ? '↑' : '↓'}{Math.abs(Math.round(trend))}%
          </Text>
        </MotiView>
      </View>

      {/* AI Intelligence Sector */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.activeDot} />
          <Text style={styles.sectionLabel}>SYSTEM VERDICT</Text>
        </View>
        <View style={styles.textArea}>
          <TypewriterText 
            text={reckoning.verdict}
            speed={15}
            delay={800}
            style={styles.verdictText}
            onComplete={() => setVerdictComplete(true)}
          />
        </View>
      </View>

      {/* Bottlenecks revealed after verdict */}
      {reckoning.bottleneck && verdictComplete && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.activeDot, { backgroundColor: RED }]} />
            <Text style={[styles.sectionLabel, { color: RED }]}>CRITICAL BOTTLENECK</Text>
          </View>
          <View style={[styles.textArea, { borderColor: 'rgba(204, 0, 0, 0.2)' }]}>
            <TypewriterText 
              text={reckoning.bottleneck}
              speed={10}
              style={styles.bottleneckText}
              onComplete={() => setBottleneckComplete(true)}
            />
          </View>
        </MotiView>
      )}

      {/* Year-End Projection */}
      {bottleneckComplete && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.projectionBox}
        >
          <Text style={styles.projectionLabel}>365-DAY PROJECTION</Text>
          <Text style={styles.projectionText}>{reckoning.projection}</Text>
        </MotiView>
      )}

      {/* Final Directive */}
      {bottleneckComplete && (
        <MotiView 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ type: 'timing', duration: 2500, loop: true }}
          style={styles.directiveContainer}
        >
          <Text style={styles.directiveLabel}>DIRECTIVE</Text>
          <Text style={styles.directiveText}>{reckoning.directive}</Text>
        </MotiView>
      )}
    </MotiView>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return GOLD;
  if (score >= 50) return TEXT_PRIMARY;
  return RED;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    paddingBottom: 16,
  },
  title: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'ui-monospace',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 4,
    fontFamily: 'ui-monospace',
  },
  date: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontFamily: 'ui-monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: -1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  sectionLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'ui-monospace',
  },
  textArea: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
    paddingLeft: 16,
  },
  verdictText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
  },
  bottleneckText: {
    color: RED,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'ui-monospace',
  },
  projectionBox: {
    backgroundColor: 'rgba(201, 168, 76, 0.03)',
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.1)',
    marginBottom: 24,
  },
  projectionLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'ui-monospace',
  },
  projectionText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  directiveContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
    paddingTop: 20,
    alignItems: 'center',
  },
  directiveLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: 'ui-monospace',
  },
  directiveText: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
    textTransform: 'uppercase',
  },
});
