// Vault — Accounts Screen
// All connected accounts, grouped by type. Floating "+" to add new connections.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useAccounts } from '../hooks/useAccounts';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import AccountTile from '../components/AccountTile';
import type { Account } from '../types';

// Section header component (inline until the shared component is built)
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <View style={styles.sectionHeaderBadge}>
        <Text style={styles.sectionHeaderBadgeText}>{count}</Text>
      </View>
    </View>
  );
}

type AccountGroup = {
  label: string;
  type: Account['type'];
  items: Account[];
};

export default function AccountsScreen() {
  const { accounts, isLoading, removeAccount, reload } = useAccounts();
  const [connectSheetVisible, setConnectSheetVisible] = useState(false);

  const groups = ([
    {
      label: 'Banking',
      type: 'bank' as const,
      items: accounts.filter((a) => a.type === 'bank'),
    },
    {
      label: 'Crypto',
      type: 'crypto' as const,
      items: accounts.filter((a) => a.type === 'crypto'),
    },
    {
      label: 'Investments',
      type: 'investment' as const,
      items: accounts.filter((a) => a.type === 'investment'),
    },
  ] satisfies AccountGroup[]).filter((g) => g.items.length > 0);

  const hasAccounts = accounts.length > 0;

  const handleConnectBank = () => {
    setConnectSheetVisible(false);
    Alert.alert(
      'Connect Bank',
      'Vault uses TrueLayer to securely link your bank account. You will be redirected to your bank\'s authorisation page.\n\nYour login credentials are never seen or stored by Vault.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // TrueLayer OAuth flow will be implemented here
          },
        },
      ]
    );
  };

  const handleConnectCrypto = () => {
    setConnectSheetVisible(false);
    Alert.alert(
      'Connect Crypto',
      'Enter a public wallet address or read-only API key to track your crypto holdings. Private keys are never requested.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Crypto connection flow will be implemented here
          },
        },
      ]
    );
  };

  const handleDisconnect = (account: Account) => {
    Alert.alert(
      'Disconnect Account',
      `Remove "${account.name}" from Vault? This will delete all associated transaction history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => removeAccount(account.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <Text style={styles.headerSubtitle}>
          {hasAccounts
            ? `${accounts.length} account${accounts.length !== 1 ? 's' : ''} connected`
            : 'No accounts yet'}
        </Text>
      </View>

      {/* Account list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          !hasAccounts && styles.scrollContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hasAccounts ? (
          groups.map((group) => (
            <View key={group.type} style={styles.group}>
              <SectionHeader title={group.label} count={group.items.length} />
              {group.items.map((account) => (
                <AccountTile
                  key={account.id}
                  account={account}
                  onPress={() => handleDisconnect(account)}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>◈</Text>
            <Text style={styles.emptyTitle}>No accounts connected</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to link your first bank account, crypto wallet, or investment portfolio.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setConnectSheetVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonLabel}>Connect Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating + button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setConnectSheetVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Connect bottom sheet */}
      <Modal
        visible={connectSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConnectSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setConnectSheetVisible(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Connect Account</Text>
          <Text style={styles.sheetSubtitle}>
            All data is stored locally on your device.
          </Text>

          <TouchableOpacity
            style={styles.sheetOption}
            onPress={handleConnectBank}
            activeOpacity={0.8}
          >
            <View style={styles.sheetOptionIcon}>
              <Text style={styles.sheetOptionIconText}>◻</Text>
            </View>
            <View style={styles.sheetOptionMeta}>
              <Text style={styles.sheetOptionTitle}>Connect Bank</Text>
              <Text style={styles.sheetOptionSubtitle}>
                Via TrueLayer — Barclays, HSBC, Monzo, Starling & more
              </Text>
            </View>
            <Text style={styles.sheetOptionChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.sheetDivider} />

          <TouchableOpacity
            style={styles.sheetOption}
            onPress={handleConnectCrypto}
            activeOpacity={0.8}
          >
            <View style={styles.sheetOptionIcon}>
              <Text style={styles.sheetOptionIconText}>◈</Text>
            </View>
            <View style={styles.sheetOptionMeta}>
              <Text style={styles.sheetOptionTitle}>Connect Crypto</Text>
              <Text style={styles.sheetOptionSubtitle}>
                BTC, ETH, SOL — read-only, no private keys
              </Text>
            </View>
            <Text style={styles.sheetOptionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetCancel}
            onPress={() => setConnectSheetVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.sheetCancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingBottom: 100, // space for FAB
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Groups
  group: {
    marginBottom: spacing.lg,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionHeaderBadge: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sectionHeaderBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.textMuted,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  emptyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.background,
    lineHeight: 32,
  },

  // Bottom sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  sheetOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionIconText: {
    fontSize: 20,
    color: colors.gold,
  },
  sheetOptionMeta: {
    flex: 1,
    gap: 3,
  },
  sheetOptionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  sheetOptionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sheetOptionChevron: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: fontWeight.regular,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  sheetCancel: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.lg,
  },
  sheetCancelLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
});
