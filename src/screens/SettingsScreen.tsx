// Vault — Settings Screen
// Security, account management, data controls, and subscription management.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import { useAccounts } from '../hooks/useAccounts';
import { useAuthContext } from '../hooks/AuthContext';
import { getPreference } from '../database/database';
import { APP_CONFIG } from '../constants/config';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

function SettingRow({ label, value, onPress, rightElement, destructive, disabled }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={disabled || !onPress}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, destructive && styles.destructiveText]}>
          {label}
        </Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {rightElement ?? (
        onPress ? <Text style={styles.rowChevron}>›</Text> : null
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { accounts, removeAccount } = useAccounts();
  const { hasBiometrics, biometricType, toggleBiometric } = useAuthContext();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Load persisted biometric preference on mount
  useEffect(() => {
    getPreference('biometric_enabled').then((val) => {
      if (val !== null) setBiometricEnabled(val !== 'false');
    });
  }, []);

  const handleBiometricToggle = useCallback(async (value: boolean) => {
    setBiometricEnabled(value);
    await toggleBiometric(value);
  }, [toggleBiometric]);

  const handleDisconnectAccount = useCallback((accountId: string, accountName: string) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect ${accountName}? All local data for this account will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => removeAccount(accountId),
        },
      ]
    );
  }, [removeAccount]);

  const handleDeleteAllData = useCallback(() => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your financial data, connected accounts, and preferences from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            // Second confirmation — irreversible action
            Alert.alert(
              'Are you absolutely sure?',
              'All Vault data will be permanently erased from this device.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Erase Everything',
                  style: 'destructive',
                  onPress: async () => {
                    for (const account of accounts) {
                      await removeAccount(account.id);
                    }
                    Alert.alert('Done', 'All Vault data has been deleted from this device.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [accounts, removeAccount]);

  const handleExportPDF = useCallback(() => {
    Alert.alert('Coming Soon', 'PDF export will be available in a future update.');
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <SettingRow
              label={biometricType ? `${biometricType} Lock` : 'Biometric Lock'}
              value={hasBiometrics ? undefined : 'Not available on this device'}
              rightElement={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: colors.surfaceHighlight, true: colors.gold }}
                  thumbColor={colors.white}
                  disabled={!hasBiometrics}
                />
              }
            />
          </View>
        </View>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <View style={styles.card}>
            {accounts.length > 0 ? (
              accounts.map((account, index) => (
                <View key={account.id}>
                  <SettingRow
                    label={account.name}
                    value={account.provider}
                    onPress={() => handleDisconnectAccount(account.id, account.name)}
                    rightElement={<Text style={styles.disconnectText}>Disconnect</Text>}
                  />
                  {index < accounts.length - 1 && <View style={styles.separator} />}
                </View>
              ))
            ) : (
              <SettingRow
                label="No accounts connected"
                value="Go to Accounts tab to connect"
              />
            )}
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <SettingRow
              label="Export Data (PDF)"
              value="Coming soon"
              onPress={handleExportPDF}
              disabled
            />
            <View style={styles.separator} />
            <SettingRow
              label="Delete All Data"
              onPress={handleDeleteAllData}
              destructive
            />
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <SettingRow
              label="Vault Premium — £4.99/month"
              value="Active · Renews monthly"
              onPress={() =>
                Alert.alert(
                  'Manage Subscription',
                  'Manage your Vault Premium subscription via the App Store or Google Play Store.',
                  [{ text: 'OK' }]
                )
              }
              rightElement={<Text style={styles.manageText}>Manage</Text>}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingRow label="Version" value={`${APP_CONFIG.version}`} />
            <View style={styles.separator} />
            <SettingRow
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy', 'Vault never collects, transmits, or stores your data on any server. All financial data lives exclusively on your device.')}
            />
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyIcon}>◇</Text>
          <Text style={styles.privacyText}>
            No data is collected. No analytics. No tracking.{'\n'}
            Your financial data never leaves this device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  rowChevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  destructiveText: {
    color: colors.negative,
    fontWeight: fontWeight.medium,
  },
  disconnectText: {
    fontSize: fontSize.sm,
    color: colors.negative,
    fontWeight: fontWeight.medium,
  },
  manageText: {
    fontSize: fontSize.sm,
    color: colors.gold,
    fontWeight: fontWeight.medium,
  },
  privacyNotice: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  privacyIcon: {
    fontSize: 24,
    color: colors.gold,
  },
  privacyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
