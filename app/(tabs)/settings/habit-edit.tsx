/**
 * Edit Habit Screen
 * Allows users to edit habit name and non-negotiable status
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
  TextInput,
  View,
} from 'react-native';

import {
  BASE,
  BORDER,
  GOLD,
  GOLD_SUBTLE,
  RED,
  RED_SUBTLE,
  SURFACE,
  SURFACE_2,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';

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
      Alert.alert('Error', 'Failed to load habit');
      router.back();
    } else {
      setHabit(data as Habit);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Habit name is required');
      return;
    }

    setSaving(true);

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
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Habit updated', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('habits')
              .delete()
              .eq('id', habitId);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
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
          <Text style={styles.loadingText}>Loading habit...</Text>
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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Habit</Text>
          <Pressable
            onPress={handleSave}
            disabled={saving || !name.trim()}
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning meditation"
              placeholderTextColor={TEXT_MUTED}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {/* Non-Negotiable Toggle */}
          <Pressable
            style={[
              styles.toggleCard,
              isNonNegotiable && styles.toggleCardActive,
            ]}
            onPress={() => setIsNonNegotiable(!isNonNegotiable)}
          >
            <View style={styles.toggleInfo}>
              <View style={styles.toggleHeader}>
                <Text style={[
                  styles.toggleTitle,
                  isNonNegotiable && styles.toggleTitleActive,
                ]}>
                  Non-Negotiable
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
                Missing this habit adds 10 points of identity debt. 
                Non-negotiables have 2x weight in scoring.
              </Text>
            </View>
          </Pressable>

          {/* Weight Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Current Weight</Text>
            <Text style={styles.infoValue}>
              {isNonNegotiable ? '2x (Non-Negotiable)' : '1x (Standard)'}
            </Text>
            <Text style={styles.infoHint}>
              Non-negotiable habits count double in your Identity Alignment Score.
            </Text>
          </View>

          {/* Delete Button */}
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Habit</Text>
          </Pressable>
          <Text style={styles.deleteHint}>
            This will remove all historical data for this habit.
          </Text>
        </View>
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
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: BASE,
    fontSize: 14,
    fontWeight: '700',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 15,
  },

  // Form
  form: {
    gap: 20,
  },

  // Input
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TEXT_PRIMARY,
    fontSize: 16,
  },

  // Toggle Card
  toggleCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  toggleTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  toggleTitleActive: {
    color: GOLD,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: BORDER,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: GOLD,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SURFACE,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  infoValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoHint: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  // Delete
  deleteButton: {
    backgroundColor: RED_SUBTLE,
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: RED,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteHint: {
    color: TEXT_MUTED,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
