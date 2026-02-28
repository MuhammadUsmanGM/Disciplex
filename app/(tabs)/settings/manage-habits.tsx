/**
 * Manage Habits Screen
 * Refined Tactical Flow V.01
 */

import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useRouter } from 'expo-router';
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
    BORDER,
    GOLD,
    GOLD_SUBTLE,
    RED,
    SURFACE,
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY
} from '@/constants/theme';
import { PremiumInput } from '@/src/components/ui/PremiumInput';
import { TypewriterText } from '@/src/components/ui/TypewriterText';
import { useSound } from '@/src/hooks/useSound';
import { ActionIcons, FeatureIcons, Icons } from '@/src/utils/icons';
import { MotiView } from 'moti';

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
  const { playSound } = useSound();

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
      'TERMINATE PROTOCOL',
      `THIS WILL PERMANENTLY REMOVE "${habitName.toUpperCase()}" AND ALL HISTORICAL DATA. CONFIRM?`,
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
              playSound('ALERT', 0.4);
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
            <Text style={styles.headerLabel}>BEHAVIORAL STANDARDS</Text>
            <Text style={styles.headerSub}>PROTOCOL CONFIGURATION V.01</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              playSound('CHECK', 0.2);
              setShowAddForm(true);
            }}
          >
            <Icons.Plus size={20} color={GOLD} />
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <FeatureIcons.Target size={18} color={GOLD} />
          <TypewriterText 
            text="THESE STANDARDS DEFINE YOUR IDENTITY INTEGRITY. CORE PROTOCOLS (NON-NEGOTIABLES) INCUR DEBT IF BREACHED."
            speed={15}
            style={styles.infoText}
          />
        </View>

        {/* Habits List */}
        {loading ? (
          <Text style={styles.emptyText}>SYNCING PROTOCOLS...</Text>
        ) : localHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NO ACTIVE STANDARDS</Text>
            <Text style={styles.emptySubtext}>
              INITIALIZE YOUR FIRST CORE PROTOCOL TO START MEASURING ALIGNMENT.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => {
                playSound('CHECK', 0.2);
                setShowAddForm(true);
              }}
            >
              <Text style={styles.emptyButtonText}>INITIALIZE</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.habitsGrid}>
            {localHabits.map((habit, index) => (
              <MotiView
                key={habit.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: index * 50 }}
              >
                <HabitCard
                  habit={habit}
                  onEdit={() =>
                    router.push({
                      pathname: '/(tabs)/settings/habit-edit' as any,
                      params: { habitId: habit.id },
                    } as any)
                  }
                  onDelete={() => handleDelete(habit.id, habit.name)}
                />
              </MotiView>
            ))}
          </View>
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
                Alert.alert('ERROR', error.message);
              } else {
                playSound('COMPLETE', 0.5);
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
  const { playSound } = useSound();

  return (
    <View style={[styles.habitCard, habit.is_non_negotiable && styles.habitCardNN]}>
      <View style={styles.habitHeader}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name.toUpperCase()}</Text>
          <View style={styles.habitMetaRow}>
            <View style={styles.weightBadge}>
              <Text style={styles.weightBadgeText}>{habit.weight}X IMPACT</Text>
            </View>
            {habit.is_non_negotiable && (
              <View style={styles.nnBadge}>
                <Text style={styles.nnBadgeText}>CORE PROTOCOL</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.habitActions}>
          <Pressable 
            style={styles.actionButton} 
            onPress={() => {
              playSound('CHECK', 0.1);
              onEdit();
            }}
          >
            <ActionIcons.Unlock size={14} color={GOLD} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              playSound('ALERT', 0.3);
              onDelete();
            }}
          >
            <ActionIcons.Trash size={14} color={RED} />
          </Pressable>
        </View>
      </View>
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
  const { playSound } = useSound();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), isNonNegotiable);
    setSaving(false);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
           <Text style={styles.modalTitle}>INITIALIZE PROTOCOL</Text>
           <Pressable onPress={() => { playSound('UNCHECK', 0.2); onClose(); }}>
              <ActionIcons.Close size={20} color={TEXT_MUTED} />
           </Pressable>
        </View>

        <View style={styles.inputGroup}>
           <PremiumInput
              label="PROTOCOL IDENTIFIER"
              value={name}
              onChangeText={setName}
              placeholder="e.g., DEEP_WORK_BLOCK"
              autoFocus
           />
        </View>

        <Pressable
          style={[
            styles.toggleRow,
            isNonNegotiable && styles.toggleRowActive,
          ]}
          onPress={() => {
            playSound('CHECK', 0.15);
            setIsNonNegotiable(!isNonNegotiable);
          }}
        >
          <View style={styles.toggleInfo}>
            <Text style={[
              styles.toggleLabel,
              isNonNegotiable && styles.toggleLabelActive,
            ]}>
              CORE PROTOCOL
            </Text>
            <Text style={styles.toggleSubtext}>
              MISSING ADDS IDENTITY DEBT
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
            <Text style={styles.cancelButtonText}>ABORT</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'VETTING...' : 'DEPLOY'}
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
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: 'ui-monospace',
  },
  headerSub: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontFamily: 'ui-monospace',
    lineHeight: 16,
  },

  // Habits grid
  habitsGrid: {
    gap: 12,
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
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptySubtext: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'ui-monospace',
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: BASE,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
  },

  // Habit Card
  habitCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
  },
  habitCardNN: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    marginBottom: 6,
    letterSpacing: 1,
  },
  habitMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weightBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightBadgeText: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
  },
  nnBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  nnBadgeText: {
    color: BASE,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: 'ui-monospace',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: 'rgba(204, 0, 0, 0.2)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 24,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: 'ui-monospace',
  },
  inputGroup: {
    marginBottom: 24,
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
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
  },
  toggleLabelActive: {
    color: GOLD,
  },
  toggleSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
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

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 4,
  },
});
