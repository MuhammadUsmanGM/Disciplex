/**
 * Manage Habits Screen
 * Allows users to add, edit, and delete habits
 */

import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { ActionIcons, FeatureIcons } from '@/src/utils/icons';

interface Habit {
  id: string;
  name: string;
  is_non_negotiable: boolean;
  weight: number;
}

export default function ManageHabitsScreen() {
  const router = useRouter();
  const { habits, loadDataFromCloud } = useHabitStore();
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    await loadDataFromCloud();
    setLoading(false);
  };

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? This cannot be undone.`,
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
              setLocalHabits((prev) => prev.filter((h) => h.id !== habitId));
              loadDataFromCloud();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Manage Habits</Text>
            <Text style={styles.headerSub}>
              Edit your non-negotiable behaviors
            </Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <ActionIcons.Check size={20} color={GOLD} />
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <FeatureIcons.Target size={20} color={GOLD} />
          <Text style={styles.infoText}>
            These habits determine your Identity Alignment Score. Missing non-negotiables adds identity debt.
          </Text>
        </View>

        {/* Habits List */}
        {loading ? (
          <Text style={styles.emptyText}>Loading habits...</Text>
        ) : localHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first non-negotiable behavior to start tracking.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.emptyButtonText}>Add Habit</Text>
            </Pressable>
          </View>
        ) : (
          localHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() =>
                router.push({
                  pathname: '/(tabs)/settings/habit-edit' as any,
                  params: { habitId: habit.id },
                } as any)
              }
              onDelete={() => handleDelete(habit.id, habit.name)}
            />
          ))
        )}

        {/* Add Habit Form Modal */}
        {showAddForm && (
          <AddHabitForm
            onClose={() => setShowAddForm(false)}
            onAdd={async (name, isNonNegotiable) => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase.from('habits').insert({
                user_id: user.id,
                name,
                is_non_negotiable: isNonNegotiable,
                weight: isNonNegotiable ? 2 : 1,
              });

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                setShowAddForm(false);
                loadDataFromCloud();
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HabitCard({
  habit,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.habitCard, habit.is_non_negotiable && styles.habitCardNN]}>
      <View style={styles.habitHeader}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          {habit.is_non_negotiable && (
            <View style={styles.nnBadge}>
              <Text style={styles.nnBadgeText}>NON-NEGOTIABLE</Text>
            </View>
          )}
        </View>
        <View style={styles.habitActions}>
          <Pressable style={styles.actionButton} onPress={onEdit}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.habitMeta}>
        Weight: {habit.weight}x
      </Text>
    </View>
  );
}

function AddHabitForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, isNonNegotiable: boolean) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [isNonNegotiable, setIsNonNegotiable] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), isNonNegotiable);
    setSaving(false);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add New Habit</Text>

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
            onSubmitEditing={handleSubmit}
          />
        </View>

        <Pressable
          style={[
            styles.toggleRow,
            isNonNegotiable && styles.toggleRowActive,
          ]}
          onPress={() => setIsNonNegotiable(!isNonNegotiable)}
        >
          <View style={styles.toggleInfo}>
            <Text style={[
              styles.toggleLabel,
              isNonNegotiable && styles.toggleLabelActive,
            ]}>
              Non-Negotiable
            </Text>
            <Text style={styles.toggleSubtext}>
              Missing this adds identity debt
            </Text>
          </View>
          <View style={[
            styles.toggle,
            isNonNegotiable && styles.toggleActive,
          ]}>
            <View style={[
              styles.toggleKnob,
              isNonNegotiable && styles.toggleKnobActive,
            ]} />
          </View>
        </Pressable>

        <View style={styles.modalActions}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Add Habit'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
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
    marginBottom: 20,
  },
  headerLabel: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },

  // Empty State
  emptyState: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: BASE,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },

  // Habit Card
  habitCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitCardNN: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  nnBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  nnBadgeText: {
    color: BASE,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: SURFACE_2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: RED_SUBTLE,
  },
  deleteButtonText: {
    color: RED,
  },
  habitMeta: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'ui-monospace',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TEXT_PRIMARY,
    fontSize: 16,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SURFACE_2,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  toggleRowActive: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleLabelActive: {
    color: GOLD,
  },
  toggleSubtext: {
    color: TEXT_MUTED,
    fontSize: 12,
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

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: SURFACE_2,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: BASE,
    fontSize: 15,
    fontWeight: '700',
  },
});
