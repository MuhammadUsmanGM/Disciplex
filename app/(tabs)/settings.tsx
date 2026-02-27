import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BASE,
  BORDER,
  GOLD,
  GOLD_SUBTLE,
  RED,
  SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';

type TonePreference = 'analytical' | 'brutal';

export default function SettingsScreen() {
  const appVersion = '1.0.0';

  const handleExportData = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem('onboarding_data');
      const allKeys = await AsyncStorage.getAllKeys();
      
      // For now, just show a simple alert - will be replaced with actual export
      console.log('Exporting data...', {
        onboarding: onboardingData,
        totalKeys: allKeys.length,
      });
      
      // TODO: Implement actual file export
      alert('Data export coming in next update. For now, check console for debug output.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_complete');
      await AsyncStorage.removeItem('onboarding_data');
      alert('Onboarding reset. Restart the app to begin again.');
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset onboarding');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = confirm(
      'This will permanently delete all your habits, completions, and scores. This cannot be undone.',
    );
    
    if (confirmed) {
      try {
        await AsyncStorage.multiRemove([
          'onboarding_complete',
          'onboarding_data',
          'disciplex_habit_store',
        ]);
        alert('All data deleted. Restart the app to begin fresh.');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete data');
      }
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Settings</Text>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Disciplex</Text>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          <Text style={styles.tagline}>The AI Discipline Operating System</Text>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          
          <View style={styles.card}>
            <SettingRow
              label="Reckoning Delivery"
              value="Sunday, 8:00 PM"
              disabled
              hint="Coming in next update"
            />
            <View style={styles.separator} />
            <SettingRow
              label="AI Tone"
              value="Analytical"
              disabled
              hint="Configure in onboarding"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data</Text>
          
          <View style={styles.card}>
            <PressableRow onPress={handleExportData}>
              <Text style={styles.rowLabel}>Export My Data</Text>
              <Text style={styles.rowHint}>Download all your habits and scores</Text>
            </PressableRow>
            <View style={styles.separator} />
            <PressableRow onPress={handleResetOnboarding}>
              <Text style={[styles.rowLabel, { color: GOLD }]}>Reset Onboarding</Text>
              <Text style={styles.rowHint}>Complete setup again</Text>
            </PressableRow>
            <View style={styles.separator} />
            <PressableRow onPress={handleDeleteAllData} danger>
              <Text style={[styles.rowLabel, { color: RED }]}>Delete All Data</Text>
              <Text style={styles.rowHint}>Permanent and irreversible</Text>
            </PressableRow>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          
          <View style={styles.card}>
            <PressableRow
              onPress={() => Linking.openURL('https://github.com/MuhammadUsmanGM/Disciplex')}
            >
              <Text style={styles.rowLabel}>View on GitHub</Text>
              <Text style={styles.rowHint}>Open source</Text>
            </PressableRow>
            <View style={styles.separator} />
            <PressableRow
              onPress={() => Linking.openURL('https://github.com/MuhammadUsmanGM/Disciplex/blob/main/disciplex.md')}
            >
              <Text style={styles.rowLabel}>Product Spec</Text>
              <Text style={styles.rowHint}>Read the full vision</Text>
            </PressableRow>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Disciplex is a behavioral measurement system.
          </Text>
          <Text style={styles.footerText}>
            It quantifies the gap between who you claim to be and what your actions prove you are.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingRow({
  label,
  value,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
        {hint && <Text style={styles.settingHint}>{hint}</Text>}
      </View>
      <Text style={[styles.settingValue, disabled && styles.settingValueDisabled]}>
        {value}
      </Text>
    </View>
  );
}

function PressableRow({
  onPress,
  children,
  danger,
}: {
  onPress: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <View
      style={[styles.pressableRow, danger && styles.pressableRowDanger]}
      onStartShouldSetResponder={() => true}
      onTouchStart={onPress}
    >
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerLabel: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Section
  section: {
    marginTop: 28,
  },
  sectionLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 10,
  },

  // Card
  card: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  versionText: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  tagline: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  settingLabelDisabled: {
    opacity: 0.5,
  },
  settingHint: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'ui-monospace',
  },
  settingValue: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  settingValueDisabled: {
    opacity: 0.5,
  },

  // Pressable Row
  pressableRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressableRowDanger: {
    backgroundColor: RED_SUBTLE,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 16,
  },

  // Row Label
  rowLabel: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  rowHint: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'ui-monospace',
  },

  // Footer
  footer: {
    marginTop: 40,
    paddingHorizontal: 8,
  },
  footerText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
});
