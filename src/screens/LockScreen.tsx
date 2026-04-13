// Vault — Lock Screen
// The first thing a user sees. Biometric gate before any financial data is shown.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useAuthContext } from '../hooks/AuthContext';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

export default function LockScreen() {
  const { isLoading, hasBiometrics, biometricType, authenticate } = useAuthContext();

  const handleUnlock = async () => {
    await authenticate();
  };

  const biometricLabel = biometricType
    ? `Unlock with ${biometricType}`
    : 'Unlock Vault';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        <Text style={styles.logo}>VAULT</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Your money. Your device. Your rules.</Text>
      </View>

      {/* Unlock section */}
      <View style={styles.unlockSection}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.gold} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleUnlock}
              activeOpacity={0.8}
            >
              <Text style={styles.unlockIcon}>
                {biometricType === 'Face ID' ? '⬡' : '◈'}
              </Text>
              <Text style={styles.unlockLabel}>{biometricLabel}</Text>
            </TouchableOpacity>

            {!hasBiometrics && (
              <Text style={styles.noBiometricNote}>
                Set up biometrics in your device settings for the full Vault experience.
              </Text>
            )}
          </>
        )}
      </View>

      {/* Bottom notice */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>No data leaves your device — ever.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 12,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.4,
    marginVertical: spacing.md,
  },
  tagline: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  unlockSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  unlockButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    minWidth: 220,
  },
  unlockIcon: {
    fontSize: 32,
    color: colors.gold,
  },
  unlockLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  noBiometricNote: {
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
