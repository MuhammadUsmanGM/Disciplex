import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
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
    RED,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from '@/constants/theme';
import { LiveBackground } from '@/src/components/ui/LiveBackground';
import { PremiumInput } from '@/src/components/ui/PremiumInput';
import { supabase } from '@/src/lib/supabase';
import { createStaggerAnimation, FadeIn } from '@/src/utils/animations';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace('/(tabs)' as never);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <LiveBackground />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <MotiView {...createStaggerAnimation(0, 100)} style={styles.headerContainer}>
            <Text style={styles.kicker}>Disciplex OS</Text>
            <Text style={styles.header}>Access Protocol</Text>
            <Text style={styles.subtext}>Provide authorized credentials to resume performance tracking.</Text>
          </MotiView>

          {errorMsg && (
            <MotiView {...FadeIn} style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={RED} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </MotiView>
          )}

          <MotiView {...createStaggerAnimation(1, 100)}>
            <PremiumInput
              label="Email Address"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Ionicons name="mail-outline" size={20} color={TEXT_MUTED} />}
            />
          </MotiView>

          <MotiView {...createStaggerAnimation(2, 100)}>
            <PremiumInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={TEXT_MUTED}
                  />
                </Pressable>
              }
            />
          </MotiView>

          <MotiView {...createStaggerAnimation(3, 100)}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.disabledButton,
                pressed && { scale: 0.98, opacity: 0.9 }
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Authenticating...' : 'Authenticate'}
              </Text>
            </Pressable>
          </MotiView>

          <MotiView {...createStaggerAnimation(4, 100)} style={styles.footer}>
            <Pressable
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/(auth)/reset-password' as never)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.linkButton} onPress={() => router.push('/(auth)/register' as never)}>
              <Text style={styles.linkText}>Establish new identity profile</Text>
            </Pressable>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BASE },
  container: {
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    marginBottom: 40,
  },
  kicker: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontFamily: 'ui-monospace',
  },
  header: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtext: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(204, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: RED,
    fontSize: 14,
    fontFamily: 'ui-monospace',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  forgotPasswordButton: {
    padding: 10,
  },
  forgotPasswordText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
    marginVertical: 24,
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
