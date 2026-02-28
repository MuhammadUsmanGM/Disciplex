import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { createStaggerAnimation, FadeIn } from '@/src/utils/animations';
import { MotiView } from 'moti';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength === 0) return SURFACE_2;
    if (strength === 1) return RED;
    if (strength === 2) return '#D4A373';
    return GOLD;
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace('/onboarding' as never);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <MotiView {...createStaggerAnimation(0, 80)}>
            <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/favicon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </MotiView>

          <MotiView {...createStaggerAnimation(1, 80)}>
            <Text style={styles.header}>Initialize Identity</Text>
            <Text style={styles.subtext}>Declare your standard and accept accountability.</Text>
          </MotiView>

          {errorMsg && (
            <MotiView {...FadeIn} style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </MotiView>
          )}

          <MotiView {...createStaggerAnimation(2, 80)} style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={TEXT_MUTED}
              value={name}
              onChangeText={setName}
            />
          </MotiView>

          <MotiView {...createStaggerAnimation(3, 80)} style={styles.inputGroup}>
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

          <MotiView {...createStaggerAnimation(4, 80)} style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
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
            
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            strength >= level ? getStrengthColor() : SURFACE_2,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {getStrengthLabel()}
                </Text>
              </View>
            )}
          </MotiView>

          <MotiView {...createStaggerAnimation(5, 80)} style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={TEXT_MUTED}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={TEXT_MUTED}
                />
              </Pressable>
            </View>
          </MotiView>

          <MotiView {...createStaggerAnimation(6, 80)}>
            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Initializing...' : 'Establish Profile'}</Text>
            </Pressable>
          </MotiView>

          <MotiView {...createStaggerAnimation(7, 80)}>
            <Pressable style={styles.linkButton} onPress={() => router.replace('/(auth)/login' as never)}>
              <Text style={styles.linkText}>Active profile exists? Authenticate here.</Text>
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
    paddingTop: 60,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 240,
    height: 80,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
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
    marginBottom: 30,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    marginRight: 12,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'ui-monospace',
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
