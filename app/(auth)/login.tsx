import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
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
    RED,
    SURFACE,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from '@/constants/theme';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <MotiView {...createStaggerAnimation(0, 100)} style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </MotiView>

          <MotiView {...createStaggerAnimation(1, 100)}>
            <Text style={styles.header}>Access Protocol</Text>
            <Text style={styles.subtext}>Provide authorized credentials to resume performance tracking.</Text>
          </MotiView>

          {errorMsg && (
            <MotiView {...FadeIn} style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </MotiView>
          )}

          <MotiView {...createStaggerAnimation(2, 100)} style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={TEXT_MUTED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </MotiView>

          <MotiView {...createStaggerAnimation(3, 100)} style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={TEXT_MUTED}
                />
              </Pressable>
            </View>
          </MotiView>

          <MotiView {...createStaggerAnimation(4, 100)}>
            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Authenticating...' : 'Authenticate'}</Text>
            </Pressable>
          </MotiView>

          <MotiView {...createStaggerAnimation(5, 100)}>
            <Pressable
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/(auth)/reset-password' as never)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Pressable style={styles.linkButton} onPress={() => router.push('/(auth)/register' as never)}>
              <Text style={styles.linkText}>No identity profile? Establish one here.</Text>
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
    paddingTop: 80,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 240,
    height: 80,
  },
  header: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtext: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  errorContainer: {
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    fontFamily: 'ui-monospace',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
  },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 16,
    color: TEXT_PRIMARY,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: TEXT_PRIMARY,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
