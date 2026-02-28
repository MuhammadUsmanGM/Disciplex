/**
 * Edit Habit Screen
 * Tactical Protocol Modification V.01
 */

import { supabase } from '@/src/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    BASE,
    GOLD,
    GOLD_SUBTLE,
    RED,
    SURFACE,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY
} from '@/constants/theme';
import { PremiumInput } from '@/src/components/ui/PremiumInput';
import { useSound } from '@/src/hooks/useSound';
import { ActionIcons } from '@/src/utils/icons';
import { MotiView } from 'moti';

interface Habit {
  id: string;
  name: string;
  is_non_negotiable: boolean;
  weight: number;
}

export default function EditHabitScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [name, setName] = useState('');
  const [isNonNegotiable, setIsNonNegotiable] = useState(false);
  const [saving, setSaving] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (habitId) {
      loadHabit();
    }
  }, [habitId]);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIsNonNegotiable(habit.is_non_negotiable);
    }
  }, [habit]);

  const loadHabit = async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error || !data) {
      Alert.alert('ERROR', 'FAILED TO LOAD PROTOCOL');
      router.back();
    } else {
      setHabit(data as Habit);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('ERROR', 'PROTOCOL IDENTIFIER REQUIRED');
      return;
    }

    setSaving(true);
    playSound('CHECK', 0.2);

    const { error } = await supabase
      .from('habits')
      .update({
        name: name.trim(),
        is_non_negotiable: isNonNegotiable,
        weight: isNonNegotiable ? 2 : 1,
      })
      .eq('id', habitId);

    setSaving(false);

    if (error) {
      Alert.alert('ERROR', error.message);
    } else {
      playSound('COMPLETE', 0.4);
      router.back();
    }
  };

  const handleDelete = () => {
    playSound('ALERT', 0.3);
    Alert.alert(
      'TERMINATE PROTOCOL',
      `PERMANENTLY REMOVE "${name.trim().toUpperCase()}" FROM SYSTEM?`,
      [
        { text: 'ABORT', style: 'cancel' },
        {
          text: 'TERMINATE',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('habits')
              .delete()
              .eq('id', habitId);

            if (error) {
              Alert.alert('ERROR', error.message);
            } else {
              playSound('ALERT', 0.5);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!habit) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>SYNCING PROTOCOL...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <Pressable 
            onPress={() => { playSound('UNCHECK', 0.1); router.back(); }} 
            style={styles.backButton}
          >
            <ActionIcons.Close size={20} color={TEXT_MUTED} />
          </Pressable>
          <Text style={styles.headerTitle}>PROTOCOL_MOD</Text>
          <Pressable
            onPress={handleSave}
            disabled={saving || !name.trim()}
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'VETTING...' : 'DEPLOY'}
            </Text>
          </Pressable>
        </MotiView>

        {/* Form */}
        <MotiView 
          from={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <PremiumInput
              label="PROTOCOL IDENTIFIER"
              value={name}
              onChangeText={setName}
              placeholder="e.g., DEEP_WORK_BLOCK"
              autoFocus
            />
          </View>

          {/* Non-Negotiable Toggle */}
          <Pressable
            style={[
              styles.toggleCard,
              isNonNegotiable && styles.toggleCardActive,
            ]}
            onPress={() => {
              playSound('CHECK', 0.15);
              setIsNonNegotiable(!isNonNegotiable);
            }}
          >
            <View style={styles.toggleInfo}>
              <View style={styles.toggleHeader}>
                <Text style={[
                  styles.toggleTitle,
                  isNonNegotiable && styles.toggleTitleActive,
                ]}>
                  CORE PROTOCOL
                </Text>
                <View style={[
                  styles.toggle,
                  isNonNegotiable && styles.toggleActive,
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    isNonNegotiable && styles.toggleKnobActive,
                  ]} />
                </View>
              </View>
              <Text style={styles.toggleDescription}>
                DEBT RISK: MISSING THIS PROTOCOL ADDS 10 POINTS TO IDENTITY DEBT. 
                SCORE MULTIPLIER: 2X IMPACT ON ALIGNMENT.
              </Text>
            </View>
          </Pressable>

          {/* Weight Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SYSTEM IMPACT</Text>
            <Text style={styles.infoValue}>
              {isNonNegotiable ? '2X MULTIPLIER' : '1X MULTIPLIER'}
            </Text>
            <Text style={styles.infoHint}>
              PROBABILITY MATRIX: CORE PROTOCOLS HAVE DOUBLE THE STATISTICAL WEIGHT IN IDENTITY MEASUREMENT.
            </Text>
          </View>

          {/* Delete Button */}
          <Pressable 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>TERMINATE PROTOCOL</Text>
          </Pressable>
          <Text style={styles.deleteHint}>
            WARNING: PERMANENT SYSTEM DELETION. ALL HISTORICAL CORRELATIONS WILL BE LOST.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 4,
  },
  saveButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#0A0A0A',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
  },

  // Form
  form: {
    gap: 24,
  },

  // Input
  inputGroup: {
    marginBottom: 8,
  },

  // Toggle Card
  toggleCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 20,
  },
  toggleCardActive: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
    flex: 1,
  },
  toggleTitleActive: {
    color: GOLD,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: GOLD,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SURFACE,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'ui-monospace',
  },

  // Info Card
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 20,
  },
  infoLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'ui-monospace',
    marginBottom: 12,
  },
  infoValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  infoHint: {
    color: TEXT_MUTED,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'ui-monospace',
  },

  // Delete
  deleteButton: {
    backgroundColor: 'rgba(204, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(204, 0, 0, 0.2)',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: RED,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
  },
  deleteHint: {
    color: TEXT_MUTED,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
  },
});
