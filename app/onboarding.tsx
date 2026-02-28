import { useSound } from '@/src/hooks/useSound';
import { supabase } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  BASE,
  GOLD,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY
} from '@/constants/theme';
import { LiveBackground } from '@/src/components/ui/LiveBackground';
import { PremiumInput } from '@/src/components/ui/PremiumInput';

type TonePreference = 'analytical' | 'brutal';

interface OnboardingData {
  identity_claim: string;
  refuse_to_be: string;
  non_negotiables: [string, string, string];
  tone_preference: TonePreference;
  reckoning_time: string; // HH:MM format
}

const TOTAL_STEPS = 7;

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [step, setStep] = useState(0);
  const { playSound } = useSound();
  const [data, setData] = useState<OnboardingData>({
    identity_claim: '',
    refuse_to_be: '',
    non_negotiables: ['', '', ''],
    tone_preference: 'analytical',
    reckoning_time: '20:00', // Default to 8 PM
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
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => animateTransition(() => {
    playSound('CHECK', 0.4);
    setStep((s) => s + 1);
  });
  const goBack = () => animateTransition(() => {
    playSound('UNCHECK', 0.3);
    setStep((s) => s - 1);
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkExistingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('identity_claim')
          .eq('id', user.id)
          .single();
        if (data?.identity_claim) {
          await AsyncStorage.setItem('onboarding_complete', 'true');
          router.replace('/(tabs)' as never);
        }
      }
    };
    checkExistingProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login' as never);
  };

  const handleComplete = async () => {
    playSound('COMPLETE', 0.6);
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: userError } = await supabase.from('users').upsert({
        id: user.id,
        identity_claim: data.identity_claim,
        refuse_to_be: data.refuse_to_be,
        tone_preference: data.tone_preference,
        reckoning_time: data.reckoning_time,
      });

      if (userError) throw userError;

      const habitsToInsert = data.non_negotiables.map((name) => ({
        user_id: user.id,
        name,
        is_non_negotiable: true,
        weight: 1,
      }));

      const { error: habitsError } = await supabase.from('habits').insert(habitsToInsert);

      if (habitsError) throw habitsError;

      await AsyncStorage.setItem('onboarding_complete', 'true');
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
      <LiveBackground />
      
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

      {step > 0 && step < TOTAL_STEPS - 1 && (
        <Pressable onPress={goBack} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>← PREVIOUS</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && <WelcomeStep onNext={goNext} onSignOut={handleSignOut} />}
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
        {step === 5 && (
          <TimePickerStep
            value={data.reckoning_time}
            onChange={(v) => setData({ ...data, reckoning_time: v })}
            onNext={goNext}
          />
        )}
        {step === 6 && <CompletionStep data={data} onComplete={handleComplete} saving={saving} />}
      </Animated.View>
    </View>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function WelcomeStep({ onNext, onSignOut }: { onNext: () => void; onSignOut: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.kicker}>Protocol Initialization</Text>
        <Text style={styles.welcomeTitle}>Disciplex OS</Text>
      </View>
      
      <Text style={styles.tagline}>PROVE IT. DAILY.</Text>
      <Text style={styles.welcomeBody}>
        Disciplex is not a habit tracker.{'\n'}
        It is a behavioral measurement system built for people who are done lying to themselves.
      </Text>
      <Pressable style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>INITIALIZE</Text>
      </Pressable>

      <Pressable style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutText}>SWITCH ACCOUNT</Text>
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
        <Text style={styles.stepLabel}>Step 01 / 04</Text>
        <Text style={styles.stepHeading}>Who are you becoming?</Text>
        <Text style={styles.stepSubtext}>
          This is your standard — not a wish. Write it as if it is already true.
        </Text>
        
        <PremiumInput
          label="Identity Statement"
          value={value}
          onChangeText={onChange}
          placeholder="e.g. I am someone who executes before I consume."
          multiline
          numberOfLines={3}
          hint="Be specific. Vague identity produces vague behavior."
        />

        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>CONTINUE</Text>
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
        <Text style={styles.stepLabel}>Step 02 / 04</Text>
        <Text style={styles.stepHeading}>Who do you refuse to be?</Text>
        <Text style={styles.stepSubtext}>
          Define the version of yourself you are actively rejecting. This is your line.
        </Text>
        
        <PremiumInput
          label="Counter-Identity"
          value={value}
          onChangeText={onChange}
          placeholder="e.g. Someone who excuses their way through the day."
          multiline
          numberOfLines={3}
          hint="Every missed non-negotiable is a vote for this version of you."
        />

        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>CONTINUE</Text>
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
        <Text style={styles.stepLabel}>Step 03 / 04</Text>
        <Text style={styles.stepHeading}>Define your 3 non-negotiables.</Text>
        <Text style={styles.stepSubtext}>
          These behaviors determine your alignment score. Miss one — you pay for it.
        </Text>
        
        {([0, 1, 2] as const).map((i) => (
          <PremiumInput
            key={i}
            label={`Behavior 0${i + 1}`}
            value={values[i]}
            onChangeText={(v) => onChange(i, v)}
            placeholder={[`Train for 45 minutes`, `Write 500 words`, `No phone before 10am`][i]}
          />
        ))}

        <Pressable
          style={[styles.primaryButton, !canAdvance && styles.primaryButtonDisabled]}
          onPress={canAdvance ? onNext : undefined}
        >
          <Text style={styles.primaryButtonText}>CONTINUE</Text>
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
      <Text style={styles.stepLabel}>Step 04 / 05</Text>
      <Text style={styles.stepHeading}>Tone Selection.</Text>
      <Text style={styles.stepSubtext}>
        Choose how your weekly Reckoning is delivered. Control the pressure.
      </Text>

      <Pressable
        style={[styles.toneCard, value === 'analytical' && styles.toneCardSelected]}
        onPress={() => onChange('analytical')}
      >
        <Text style={[styles.toneCardTitle, value === 'analytical' && styles.toneCardTitleSelected]}>
          ANALYTICAL
        </Text>
        <Text style={styles.toneCardDesc}>
          Data-driven. Precise. The numbers are presented without emotion.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.toneCard, value === 'brutal' && styles.toneCardSelected]}
        onPress={() => onChange('brutal')}
      >
        <Text style={[styles.toneCardTitle, value === 'brutal' && styles.toneCardTitleSelected]}>
          BRUTAL
        </Text>
        <Text style={styles.toneCardDesc}>
          No excuses. The Reckoning says exactly what your behavior proves.
        </Text>
      </Pressable>

      <Pressable style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>CONTINUE</Text>
      </Pressable>
    </ScrollView>
  );
}

function TimePickerStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const [hours, minutes] = value.split(':').map(Number);
  
  const adjustTime = (deltaHours: number) => {
    let newHours = hours + deltaHours;
    if (newHours < 0) newHours = 23;
    if (newHours >= 24) newHours = 0;
    onChange(`${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const formatDisplayTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>Step 05 / 05</Text>
      <Text style={styles.stepHeading}>The Sunday Ritual.</Text>
      <Text style={styles.stepSubtext}>
        Define when your weekly performance verdict should be delivered.
      </Text>

      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerLabel}>DELIVERY TIME</Text>
        
        <View style={styles.timePickerControls}>
          <Pressable style={styles.timeButton} onPress={() => adjustTime(-1)}>
            <Text style={styles.timeButtonText}>−</Text>
          </Pressable>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeValue}>{formatDisplayTime(value)}</Text>
          </View>

          <Pressable style={styles.timeButton} onPress={() => adjustTime(1)}>
            <Text style={styles.timeButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>CONTINUE</Text>
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
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>IDENTITY SECURED</Text>
      </View>
      <Text style={styles.completionHeading}>Setup Complete.</Text>
      <Text style={styles.stepSubtext}>
        Your identity is now part of the Disciplex ledger. Execution is the only variable remaining.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>IDENTITY CLAIM</Text>
        <Text style={styles.summaryValue}>{data.identity_claim}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>3 NON-NEGOTIABLES</Text>
        {data.non_negotiables.map((n, i) => (
          <Text key={i} style={styles.summaryListItem}>
            0{i + 1}. {n}
          </Text>
        ))}
      </View>

      <Pressable
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
        onPress={onComplete}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>{saving ? 'PERSISTING...' : 'ENTER DISCIPLEX'}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 8,
    width: '100%',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: GOLD,
    width: 16,
    borderRadius: 2,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backText: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
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
  welcomeHeader: {
    marginBottom: 40,
  },
  kicker: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 12,
  },
  welcomeTitle: {
    color: TEXT_PRIMARY,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tagline: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: 24,
  },
  welcomeBody: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 60,
  },
  stepLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontFamily: 'ui-monospace',
  },
  stepHeading: {
    color: TEXT_PRIMARY,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42,
    marginBottom: 12,
    letterSpacing: -1,
  },
  stepSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  toneCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  toneCardSelected: {
    borderColor: GOLD,
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  toneCardTitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  toneCardTitleSelected: {
    color: GOLD,
  },
  toneCardDesc: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.2,
  },
  primaryButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  signOutButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  signOutText: {
    color: TEXT_MUTED,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  statusText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  completionHeading: {
    color: TEXT_PRIMARY,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
  },
  summaryLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  summaryValue: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
  },
  summaryListItem: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'ui-monospace',
  },
  timePickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  timePickerLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 24,
  },
  timePickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  timeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '300',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeValue: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'ui-monospace',
  },
});
