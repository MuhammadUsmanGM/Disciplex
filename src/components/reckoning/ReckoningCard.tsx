/**
 * ReckoningCard Component
 * Displays the Weekly AI Reckoning verdict
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, GLASS_BORDER, GLASS_SURFACE, GOLD, RED, TEXT_PRIMARY, TEXT_SECONDARY } from '@/constants/theme';
import { ReckoningResult } from '@/src/types/reckoning';

interface ReckoningCardProps {
  reckoning: ReckoningResult;
  weekScore: number;
  trend: number;
  date?: string;
}

export function ReckoningCard({ reckoning, weekScore, trend, date }: ReckoningCardProps) {
  const weekLabel = date || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WEEKLY RECKONING</Text>
        <Text style={styles.date}>{weekLabel}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>WEEK SCORE</Text>
          <Text style={[styles.statValue, { color: getScoreColor(weekScore) }]}>
            {Math.round(weekScore)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TREND</Text>
          <Text style={[styles.statValue, { color: trend >= 0 ? GOLD : RED }]}>
            {trend >= 0 ? '+' : ''}{Math.round(trend)}%
          </Text>
        </View>
      </View>

      {/* Verdict */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>VERDICT</Text>
        <Text style={styles.verdictText}>{reckoning.verdict}</Text>
      </View>

      {/* Bottleneck */}
      {reckoning.bottleneck ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BOTTLENECK</Text>
          <Text style={styles.bottleneckText}>{reckoning.bottleneck}</Text>
        </View>
      ) : null}

      {/* Directive */}
      <View style={[styles.section, styles.projectionSection]}>
        <Text style={styles.sectionLabel}>PROJECTION (365 DAYS)</Text>
        <Text style={styles.projectionText}>{reckoning.projection}</Text>
      </View>

      <View style={[styles.section, styles.directiveSection]}>
        <Text style={styles.sectionLabel}>DIRECTIVE</Text>
        <Text style={styles.directiveText}>{reckoning.directive}</Text>
      </View>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return GOLD;
  if (score >= 50) return TEXT_PRIMARY;
  return RED;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_SURFACE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
  },
  date: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontFamily: 'ui-monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  section: {
    marginBottom: 18,
  },
  projectionSection: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  directiveSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 10,
  },
  verdictText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  bottleneckText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
  },
  projectionText: {
    color: '#DDD',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  directiveText: {
    color: GOLD,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Fonts.mono,
  },
});
