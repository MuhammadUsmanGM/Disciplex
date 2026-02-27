import { supabase } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
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
    SURFACE,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from '@/constants/theme';

type TonePreference = 'analytical' | 'brutal';

interface OnboardingData {
  identity_claim: string;
  refuse_to_be: string;
  non_negotiables: [string, string, string];
  tone_preference: TonePreference;
}

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    identity_claim: '',
    refuse_to_be: '',
    non_negotiables: ['', '', ''],
    tone_preference: 'analytical',
  });

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => animateTransition(() => setStep((s) => s + 1));
  const goBack = () => animateTransition(() => setStep((s) => s - 1));

  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // 1. Save identity claims to users table
      const { error: userError } = await supabase.from('users').upsert({
        id: user.id,
        identity_claim: data.identity_claim,
        refuse_to_be: data.refuse_to_be,
        tone_preference: data.tone_preference,
      });

      if (userError) throw userError;

      // 2. Insert non-negotiables to habits table
      const habitsToInsert = data.non_negotiables.map((name) => ({
        user_id: user.id,
        name,
        is_non_negotiable: true,
        weight: 1,
      }));

      const { error: habitsError } = await supabase.from('habits').insert(habitsToInsert);

      if (habitsError) throw habitsError;

      // 3. Mark locally as complete
      await AsyncStorage.setItem('onboarding_complete', 'true');
      await AsyncStorage.setItem('onboarding_data', JSON.stringify(data));
      router.replace('/(tabs)' as never);
    } catch (error) {
      console.error('Error during onboarding save:', error);
      alert('Failed to save your identity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateNonNegotiable = (index: number, value: string) => {
    const updated: [string, string, string] = [...data.non_negotiables] as [string, string, string];
    updated[index] = value;
    setData({ ...data, non_negotiables: updated });
  };

  const canAdvance = () => {
    if (step === 1) return data.identity_claim.trim().length > 0;
    if (step === 2) return data.refuse_to_be.trim().length > 0;
    if (step === 3) return data.non_negotiables.every((n) => n.trim().length > 0);
    return true;
  };

  return (
    <View style={styles.root}>
      {/* Progress dots — hidden on welcome and completion */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_STEPS - 2 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step - 1 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Back button */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <Pressable onPress={goBack} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && <WelcomeStep onNext={goNext} />}
        {step === 1 && (
          <IdentityClaimStep
            value={data.identity_claim}
            onChange={(v) => setData({ ...data, identity_claim: v })}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 2 && (
          <CounteridentityStep
            value={data.refuse_to_be}
            onChange={(v) => setData({ ...data, refuse_to_be: v })}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 3 && (
          <NonNegotiablesStep
            values={data.non_negotiables}
            onChange={updateNonNegotiable}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 4 && (
          <ToneStep
            value={data.tone_preference}
            onChange={(v) => setData({ ...data, tone_preference: v })}
            onNext={goNext}
          />
        )}
        {step === 5 && <CompletionStep data={data} onComplete={handleComplete} saving={saving} />}
      </Animated.View>
    </View>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.tagline}>Prove it. Daily.</Text>
      <Text style={styles.welcomeBody}>
        Disciplex is not a habit tracker.{'\n'}
        It is a behavioral measurement system — built for people who are done lying to themselves.
      </Text>
      <Pressable style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Begin</Text>
      </Pressable>
    </ScrollView>
  );
}

function IdentityClaimStep({
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>01 / 04</Text>
        <Text style={styles.stepHeading}>Who are you becoming?</Text>
        <Text style={styles.stepSubtext}>
          This is your standard — not a wish. Write it as if it is already true.
        </Text>
        <TextInput
          style={styles.largeInput}
          value={value}
          onChangeText={onChange}
          placeholder="I am someone who executes before I consume."
          placeholderTextColor={TEXT_MUTED}
          multiline
          autoFocus
          returnKeyType="done"
          blurOnSubmit
        />
        <Text style={styles.inputHint}>Be specific. Vague identity produces vague behavior.</Text>
        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CounteridentityStep({
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>02 / 04</Text>
        <Text style={styles.stepHeading}>Who do you refuse to be?</Text>
        <Text style={styles.stepSubtext}>
          Define the version of yourself you are actively rejecting. This is your line.
        </Text>
        <TextInput
          style={[styles.largeInput, styles.largeInputDanger]}
          value={value}
          onChangeText={onChange}
          placeholder="Someone who delays, drifts, and excuses their way through the day."
          placeholderTextColor={TEXT_MUTED}
          multiline
          autoFocus
          returnKeyType="done"
          blurOnSubmit
        />
        <Text style={styles.inputHint}>
          Every missed non-negotiable is a vote for this version of you.
        </Text>
        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NonNegotiablesStep({
  values,
  onChange,
  onNext,
  canAdvance,
}: {
  values: [string, string, string];
  onChange: (i: number, v: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>03 / 04</Text>
        <Text style={styles.stepHeading}>Define your 3 non-negotiables.</Text>
        <Text style={styles.stepSubtext}>
          These are the daily behaviors that determine your alignment score. Miss one — you pay for it.
        </Text>
        {(['Behavior 1', 'Behavior 2', 'Behavior 3'] as const).map((label, i) => (
          <View key={i} style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>{label}</Text>
            <TextInput
              style={styles.behaviorInput}
              value={values[i]}
              onChangeText={(v) => onChange(i, v)}
              placeholder={`e.g. ${['Train for 45 minutes', 'Write 500 words', 'No phone before 10am'][i]}`}
              placeholderTextColor={TEXT_MUTED}
              returnKeyType={i < 2 ? 'next' : 'done'}
            />
          </View>
        ))}
        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ToneStep({
  value,
  onChange,
  onNext,
}: {
  value: TonePreference;
  onChange: (v: TonePreference) => void;
  onNext: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>04 / 04</Text>
      <Text style={styles.stepHeading}>How should I speak to you?</Text>
      <Text style={styles.stepSubtext}>
        Choose how your weekly Reckoning is delivered. You can change this later.
      </Text>

      <Pressable
        style={[styles.toneCard, value === 'analytical' && styles.toneCardSelected]}
        onPress={() => onChange('analytical')}
      >
        <Text style={[styles.toneCardTitle, value === 'analytical' && styles.toneCardTitleSelected]}>
          Analytical
        </Text>
        <Text style={styles.toneCardDesc}>
          Data-driven. Precise. The numbers are presented without emotion — your interpretation is your own.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.toneCard, value === 'brutal' && styles.toneCardSelected]}
        onPress={() => onChange('brutal')}
      >
        <Text style={[styles.toneCardTitle, value === 'brutal' && styles.toneCardTitleSelected]}>
          Brutal
        </Text>
        <Text style={styles.toneCardDesc}>
          No excuses. No softening. The Reckoning says exactly what your behavior proves — nothing more.
        </Text>
      </Pressable>

      <Pressable style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Set Tone</Text>
      </Pressable>
    </ScrollView>
  );
}

function CompletionStep({
  data,
  onComplete,
  saving,
}: {
  data: OnboardingData;
  onComplete: () => void;
  saving?: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.completionHeading}>Your identity is set.</Text>
      <Text style={styles.stepSubtext}>
        Now execution is the only variable. Here is what you have declared:
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Identity Claim</Text>
        <Text style={styles.summaryValue}>{data.identity_claim}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Refuse To Be</Text>
        <Text style={styles.summaryValue}>{data.refuse_to_be}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Non-Negotiables</Text>
        {data.non_negotiables.map((n, i) => (
          <Text key={i} style={styles.summaryListItem}>
            {i + 1}. {n}
          </Text>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Reckoning Tone</Text>
        <Text style={[styles.summaryValue, { textTransform: 'capitalize' }]}>
          {data.tone_preference}
        </Text>
      </View>

      <Pressable
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
        onPress={onComplete}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>{saving ? 'Initializing...' : 'Enter Disciplex'}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 60,
    paddingBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: GOLD,
    width: 20,
    borderRadius: 3,
  },
  dotInactive: {
    backgroundColor: BORDER,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    zIndex: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 48,
    justifyContent: 'flex-start',
  },

  // Welcome
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 220,
    height: 80,
  },
  tagline: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeBody: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 48,
  },

  // Step labels & headings
  stepLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontFamily: 'ui-monospace',
  },
  stepHeading: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 32,
  },

  // Inputs
  largeInput: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 18,
    color: TEXT_PRIMARY,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  largeInputDanger: {
    borderColor: '#3A1A1A',
    backgroundColor: '#0F0A0A',
  },
  inputHint: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 32,
    letterSpacing: 0.2,
  },

  // Non-negotiables
  behaviorRow: {
    marginBottom: 16,
  },
  behaviorLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  behaviorInput: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TEXT_PRIMARY,
    fontSize: 15,
  },

  // Tone cards
  toneCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    marginBottom: 14,
  },
  toneCardSelected: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  toneCardTitle: {
    color: TEXT_SECONDARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  toneCardTitleSelected: {
    color: GOLD,
  },
  toneCardDesc: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 21,
  },

  // Buttons
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.3,
  },
  primaryButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Completion
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  checkMark: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '300',
  },
  completionHeading: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  summaryCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  summaryLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'ui-monospace',
  },
  summaryValue: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 21,
  },
  summaryListItem: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
  },
});
