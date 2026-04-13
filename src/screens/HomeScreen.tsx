// Vault — Home Screen
// Financial command centre. Net worth hero, health ring, accounts, and recent activity.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useAccounts } from '../hooks/useAccounts';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import AccountTile from '../components/AccountTile';
import HealthRing from '../components/HealthRing';
import Card from '../components/Card';

function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}£${formatted}`;
}

export default function HomeScreen() {
  const { accounts, totalNetWorth, netWorthByType, isLoading, reload } = useAccounts();

  // Placeholder health score — will be wired to calculateHealthScore service
  const healthScore = 72;

  const hasAccounts = accounts.length > 0;

  const netWorthChange = useMemo(() => {
    // Placeholder: will derive from netWorthHistory once available
    return { amount: 1240.5, percent: 2.3, isPositive: true };
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* ── Hero: Net Worth ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Total Net Worth</Text>
          <Text style={styles.heroValue}>{formatCurrency(totalNetWorth)}</Text>
          <View style={styles.changeRow}>
            <Text
              style={[
                styles.changeText,
                { color: netWorthChange.isPositive ? colors.positive : colors.negative },
              ]}
            >
              {netWorthChange.isPositive ? '+' : ''}
              {formatCurrency(netWorthChange.amount)}
            </Text>
            <Text style={styles.changePeriod}> this month</Text>
          </View>
        </View>

        {/* ── Health Score ── */}
        <View style={styles.healthSection}>
          <HealthRing score={healthScore} size={120} strokeWidth={10} />
          <View style={styles.healthMeta}>
            <Text style={styles.healthTitle}>Financial Health</Text>
            <Text style={styles.healthScore}>{healthScore}/100</Text>
            <Text style={styles.healthNote}>
              {healthScore >= 80
                ? 'Excellent — keep it up'
                : healthScore >= 60
                ? 'Good — room to improve'
                : 'Needs attention'}
            </Text>
          </View>
        </View>

        {/* ── Net Worth Breakdown ── */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Banking</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(netWorthByType.banking)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Crypto</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(netWorthByType.crypto)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Investments</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(netWorthByType.investments)}
              </Text>
            </View>
          </View>
        </Card>

        {/* ── Your Accounts ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>

          {hasAccounts ? (
            accounts.map((account) => (
              <AccountTile key={account.id} account={account} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>◈</Text>
              <Text style={styles.emptyTitle}>No accounts connected</Text>
              <Text style={styles.emptySubtitle}>
                Head to the Accounts tab to link your first bank account, crypto wallet, or investment portfolio.
              </Text>
            </View>
          )}
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityPlaceholder}>
            <Text style={styles.activityPlaceholderText}>
              Transaction history will appear here once accounts are connected.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  heroValue: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  changePeriod: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },

  // Health
  healthSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  healthMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  healthTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  healthScore: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  healthNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Breakdown card
  breakdownCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  breakdownValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  breakdownDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 36,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Activity placeholder
  activityPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  activityPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
