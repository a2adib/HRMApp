import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both your corporate email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert(
        'Authentication Failed',
        err.response?.data?.detail || err.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>HR</Text>
            </View>
            <Text style={styles.title}>Acme Global</Text>
            <Text style={styles.subtitle}>Enterprise Employee Mobile Portal</Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in to your account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Corporate Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@acme-corp.com"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Demo Quick-Fill Chips */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick-fill demo account:</Text>
              <View style={styles.demoChipsRow}>
                <TouchableOpacity
                  onPress={() => fillDemo('alex.rivera@acme-corp.com')}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>Alex Rivera (Employee)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => fillDemo('marcus.brody@acme-corp.com')}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>Marcus Brody (Manager)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Protected by Enterprise 802.1X RADIUS & JWT Multi-Tenant Isolation
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: Spacing.md,
  },
  logoText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs + 2,
  },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 60,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.xs,
  },
  eyeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  demoChipsRow: {
    flexDirection: 'column',
    gap: Spacing.xs + 2,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
