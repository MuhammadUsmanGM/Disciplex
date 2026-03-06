/**
 * Password Reset Screen
 * Allows users to request a password reset email
 */

import { supabase } from '@/src/lib/supabase';
import React, { useState } from 'react';
import {
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
  GOLD_SUBTLE,
  RED,
  SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';

export default function PasswordResetScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'disciplex://reset-password', // Deep link for password reset
      });

      if (error) throw error;

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✉️</Text>
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a password reset link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              &bull; Click the link in the email to reset your password
            </Text>
            <Text style={styles.infoText}>
              &bull; Didn&apos;t receive it? Check your spam folder
            </Text>
            <Text style={styles.infoText}>
              &bull; The link expires after 24 hours
            </Text>
          </View>

          <Pressable
            style={styles.resendButton}
            onPress={() => {
              setSent(false);
              setEmail('');
            }}
          >
            <Text style={styles.resendButtonText}>Send Again</Text>
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={() => {
              // Navigate back to login
            }}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase().trim());
                setError(null);
              }}
              placeholder="your@email.com"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="send"
              onSubmitEditing={handleReset}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <Pressable
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={() => {
              // Navigate back to login
            }}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // Title
  title: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },

  // Icon
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD_SUBTLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 40,
  },

  // Input
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  inputError: {
    borderColor: RED,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    marginTop: 8,
  },
  emailHighlight: {
    color: GOLD,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 22,
  },

  // Buttons
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resendButton: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: GOLD,
    fontWeight: '600',
  },
});
