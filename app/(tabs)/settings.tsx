import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
    BORDER,
    GLASS_BORDER,
    GLASS_SURFACE,
    GOLD,
    RED,
    RED_SUBTLE,
    SURFACE,
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY
} from '@/constants/theme';
import { Paywall } from '@/src/components/ui/Paywall';
import { ThemePicker } from '@/src/components/ui/ThemePicker';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useSubscription } from '@/src/hooks/useSubscription';
import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';



export default function SettingsScreen() {
  const router = useRouter();
  const appVersion = '1.0.0';
  const { scoreHistory, habits } = useHabitStore();
  const { accentColor, setAccentColor, accentName } = useTheme();
  const {
    permissionGranted,
    loading: notifLoading,
    milestone7DayReached,
    requestPermission,
    scheduleReckoning,
    cancelReckoning,
    checkAndScheduleMilestone,
  } = useNotifications();
  const {
    isPro,
    tier,
    loading: subLoading,
    showPaywall,
    setShowPaywall,
    purchasePro,
    restorePurchases: restore,
  } = useSubscription();

  const [reckoningTime, setReckoningTime] = useState<string>('20:00');
  const [identityClaim, setIdentityClaim] = useState<string>('');
  const [refuseToBe, setRefuseToBe] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          const { data } = await supabase
            .from('users')
            .select('reckoning_time, identity_claim, refuse_to_be')
            .eq('id', user.id)
            .single();
          if (data) {
            if (data.reckoning_time) setReckoningTime(data.reckoning_time);
            if (data.identity_claim) setIdentityClaim(data.identity_claim);
            if (data.refuse_to_be) setRefuseToBe(data.refuse_to_be);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Check and schedule milestone when score history changes
  useEffect(() => {
    if (scoreHistory.length > 0) {
      checkAndScheduleMilestone(scoreHistory);
    }
  }, [scoreHistory, checkAndScheduleMilestone]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Schedule reckoning with current time
      const todayScore = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].score : undefined;
      await scheduleReckoning(reckoningTime, todayScore);
    }
  };

  const handleSaveReckoningTime = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ reckoning_time: reckoningTime })
          .eq('id', user.id);

        // Reschedule notification with new time
        if (permissionGranted) {
          const todayScore = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].score : undefined;
          await scheduleReckoning(reckoningTime, todayScore);
        }
      }
    } catch (error) {
      console.error('Failed to save reckoning time:', error);
      Alert.alert('Error', 'Failed to save preference');
    } finally {
      setIsSaving(false);
      setShowTimePicker(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (permissionGranted) {
      await cancelReckoning();
    } else {
      await handleRequestPermission();
    }
  };

  const handleRestorePurchases = async () => {
    const success = await restore();
    if (success) {
      setRestoreMessage('Purchases restored successfully!');
      setTimeout(() => setRestoreMessage(null), 3000);
    } else {
      setRestoreMessage('No active subscription found.');
      setTimeout(() => setRestoreMessage(null), 3000);
    }
  };

  const handleExportData = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem('onboarding_data');
      const allKeys = await AsyncStorage.getAllKeys();

      console.log('Exporting data...', {
        onboarding: onboardingData,
        totalKeys: allKeys.length,
      });

      Alert.alert('Export', 'Data export coming in next update. For now, check console for debug output.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_complete');
      await AsyncStorage.removeItem('onboarding_data');
      Alert.alert('Reset', 'Onboarding reset. Restart the app to begin again.');
    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleDeleteAllData = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your habits, completions, and scores. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'onboarding_complete',
                'onboarding_data',
                'disciplex_habit_store',
              ]);
              Alert.alert('System Reset', 'All data deleted. Restart the app to begin fresh.');
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          }
        }
      ]
    );
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView 
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.header}
        >
          <Text style={styles.headerLabel}>Profile</Text>
        </MotiView>

        {/* Identity Contract Section */}
        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 100 }}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Identity Contract</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/identity' as never)}
          >
            <View style={styles.identityCard}>
              <View style={styles.identityHeader}>
                <Text style={styles.identityTitle}>Current Claim</Text>
                <Text style={styles.chevron}>View Deep Analysis ›</Text>
              </View>
              <Text style={styles.identityClaimText} numberOfLines={2}>
                "{identityClaim || 'No identity claim set'}"
              </Text>
              <View style={styles.identityStats}>
                 <View style={styles.statMini}>
                    <Text style={styles.statMiniLabel}>Standards</Text>
                    <Text style={styles.statMiniValue}>{habits.length}</Text>
                 </View>
                 <View style={styles.statMini}>
                    <Text style={styles.statMiniLabel}>Debt</Text>
                    <Text style={[styles.statMiniValue, { color: useHabitStore.getState().identityDebt > 0 ? RED : TEXT_PRIMARY }]}>
                      {Math.round(useHabitStore.getState().identityDebt)}
                    </Text>
                 </View>
              </View>
            </View>
          </TouchableOpacity>
        </MotiView>

        {/* User Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Identity</Text>
                <Text style={styles.settingHint}>{userEmail}</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.pressableRow} onPress={handleSignOut}>
               <Text style={[styles.settingLabel, { color: RED }]}>Sign Out</Text>
               <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription / Pro Status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subscription</Text>

          <View style={styles.card}>
            {isPro ? (
              <View style={styles.proStatusRow}>
                <View style={styles.proStatusInfo}>
                  <View style={styles.proStatusBadge}>
                    <Text style={styles.proStatusText}>PRO</Text>
                  </View>
                  <Text style={styles.proStatusLabel}>Active Subscription</Text>
                  <Text style={styles.proStatusDetail}>
                    {tier === 'pro' ? 'Full access to AI Reckoning and analytics' : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.freeStatusRow}>
                <View style={styles.freeStatusInfo}>
                  <Text style={styles.freeStatusTitle}>Free Tier</Text>
                  <Text style={styles.freeStatusDetail}>
                    Score tracking, habit logging, basic summary
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButtonSmall}
                  onPress={() => setShowPaywall(true)}
                >
                  <Text style={styles.upgradeButtonSmallText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.separator} />

            {/* Restore Purchases */}
            <TouchableOpacity
              style={styles.pressableRow}
              onPress={handleRestorePurchases}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Restore Purchases</Text>
                <Text style={styles.settingHint}>
                  {restoreMessage || 'Recover your Pro subscription'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {!isPro && (
              <>
                <View style={styles.separator} />
                <TouchableOpacity
                  style={styles.pressableRow}
                  onPress={() => setShowPaywall(true)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: GOLD }]}>
                      Unlock Pro Features
                    </Text>
                    <Text style={styles.settingHint}>
                      AI Reckoning, Identity Debt, advanced analytics
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>

          <View style={styles.card}>
            {/* Permission Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weekly Reckoning</Text>
                <Text style={styles.settingHint}>
                  {permissionGranted ? 'Every Sunday at your chosen time' : 'Enable for Sunday verdicts'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, permissionGranted ? styles.toggleOn : styles.toggleOff]}
                onPress={handleToggleNotifications}
                disabled={notifLoading}
              >
                <Text style={[styles.toggleText, permissionGranted ? styles.toggleTextOn : styles.toggleTextOff]}>
                  {permissionGranted ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>

            {permissionGranted && (
              <>
                <View style={styles.separator} />
                
                {/* Reckoning Time Picker */}
                <TouchableOpacity
                  style={styles.pressableRow}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Reckoning Delivery</Text>
                    <Text style={styles.settingHint}>Sunday at {formatTimeDisplay(reckoningTime)}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* Time Picker UI */}
                {showTimePicker && (
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Select Time</Text>
                      <View style={styles.timeInputRow}>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => adjustTime(-1)}
                        >
                          <Text style={styles.timeButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeDisplay}>{formatTimeDisplay(reckoningTime)}</Text>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => adjustTime(1)}
                        >
                          <Text style={styles.timeButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.timePickerActions}>
                        <TouchableOpacity
                          style={styles.timeCancelButton}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={styles.timeCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.timeSaveButton}
                          onPress={handleSaveReckoningTime}
                          disabled={isSaving}
                        >
                          <Text style={styles.timeSaveText}>
                            {isSaving ? 'Saving...' : 'Save'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Milestone Status */}
                <View style={styles.separator} />
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>7-Day Milestone</Text>
                    <Text style={styles.settingHint}>
                      {milestone7DayReached ? 'Reached — notification scheduled' : 'Keep executing'}
                    </Text>
                  </View>
                  {milestone7DayReached && (
                    <View style={styles.milestoneBadge}>
                      <Text style={styles.milestoneText}>✓</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {!permissionGranted && (
              <View style={styles.separator} />
            )}
            
            {!permissionGranted && (
              <TouchableOpacity style={styles.enableButton} onPress={handleRequestPermission}>
                <Text style={styles.enableButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>

          <View style={styles.card}>
            <PressableRow onPress={() => router.push('/(tabs)/settings/manage-habits' as never)}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Manage Habits</Text>
                <Text style={styles.settingHint}>
                  {habits.length} habit{habits.length !== 1 ? 's' : ''} configured
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </PressableRow>
            <View style={styles.separator} />
            <View style={styles.themePickerRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Accent Color</Text>
                <Text style={styles.settingHint}>Currently: {accentName}</Text>
              </View>
            </View>
            <ThemePicker selectedColor={accentColor} onSelectColor={setAccentColor} />
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>AI Tone</Text>
                <Text style={styles.settingHint}>Analytical</Text>
              </View>
              <Text style={styles.settingValue}>Analytical</Text>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data</Text>

          <View style={styles.card}>
            <PressableRow onPress={() => router.push('/(tabs)/settings/reckoning-archive' as never)}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reckoning Archive</Text>
                <Text style={styles.settingHint}>
                  {isPro ? 'View all past verdicts' : 'Pro feature'}
                </Text>
              </View>
              {!isPro && <View style={styles.proBadgeSmall}><Text style={styles.proBadgeText}>PRO</Text></View>}
              <Text style={styles.chevron}>›</Text>
            </PressableRow>
            <View style={styles.separator} />
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

        {/* Paywall Modal */}
        <Paywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPurchase={purchasePro}
        />
      </ScrollView>
    </SafeAreaView>
  );

  // Helper to adjust time by 1 hour
  function adjustTime(delta: number) {
    const [hours, minutes] = reckoningTime.split(':').map(Number);
    let newHours = hours + delta;
    if (newHours < 0) newHours = 23;
    if (newHours >= 24) newHours = 0;
    setReckoningTime(`${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150, // Slightly more for settings since it tends to be longer
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
    backgroundColor: GLASS_SURFACE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
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

  // Subscription Section
  proStatusRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  proStatusInfo: {
    flex: 1,
  },
  proStatusBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  proStatusText: {
    color: '#0A0A0A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  proStatusLabel: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  proStatusDetail: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
  },
  freeStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  freeStatusInfo: {
    flex: 1,
  },
  freeStatusTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  freeStatusDetail: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
  },
  upgradeButtonSmall: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonSmallText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '700',
  },
  proBadgeSmall: {
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  proBadgeText: {
    color: '#0A0A0A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  themePickerRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
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

  // Toggle Button
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: GOLD,
  },
  toggleOff: {
    backgroundColor: SURFACE_2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  toggleTextOn: {
    color: '#0A0A0A',
  },
  toggleTextOff: {
    color: TEXT_SECONDARY,
  },

  // Enable Button
  enableButton: {
    backgroundColor: GOLD,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '700',
  },

  // Pressable Row
  pressableRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Chevron
  chevron: {
    color: TEXT_SECONDARY,
    fontSize: 20,
    fontWeight: '300',
  },

  // Time Picker
  timePickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: SURFACE_2,
  },
  timePicker: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  timePickerLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontFamily: 'ui-monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  timeDisplay: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    minWidth: 100,
    textAlign: 'center',
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE_2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  timeButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: SURFACE_2,
    alignItems: 'center',
  },
  timeCancelText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  timeSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: GOLD,
    alignItems: 'center',
  },
  timeSaveText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '700',
  },

  // Milestone Badge
  milestoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '700',
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
  // Identity Card in Profile
  identityCard: {
    padding: 16,
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  identityTitle: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
  },
  identityClaimText: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  identityStats: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 16,
  },
  statMini: {
    flexDirection: 'column',
    gap: 4,
  },
  statMiniLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
  },
  statMiniValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
});
