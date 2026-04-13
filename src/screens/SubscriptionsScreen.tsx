// Vault — Subscriptions Screen
// Track recurring charges, identify the "monthly bleed", and surface unused subscriptions.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  calculateMonthlyBleed,
  findUnusedSubscriptions,
} from '../services/subscriptionDetector';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import SubscriptionRow from '../components/SubscriptionRow';
import Card from '../components/Card';
import type { Subscription } from '../types';

// Demo subscriptions — representative data so the UI is fully visible before
// real transaction-detection data is wired through.
const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    name: 'Netflix',
    amount: 15.99,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 38, // unused — will trigger warning
    accountId: 'acc_1',
    merchant: 'Netflix',
  },
  {
    id: 'sub_2',
    name: 'Spotify',
    amount: 10.99,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 2,
    accountId: 'acc_1',
    merchant: 'Spotify',
  },
  {
    id: 'sub_3',
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 45, // unused — will trigger warning
    accountId: 'acc_1',
    merchant: 'Adobe',
  },
  {
    id: 'sub_4',
    name: 'Apple iCloud+',
    amount: 2.99,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 0,
    accountId: 'acc_1',
    merchant: 'Apple',
  },
  {
    id: 'sub_5',
    name: 'Amazon Prime',
    amount: 8.99,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 7,
    accountId: 'acc_1',
    merchant: 'Amazon',
  },
  {
    id: 'sub_6',
    name: 'GitHub Copilot',
    amount: 9.17,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextChargeDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    daysSinceLastUse: 1,
    accountId: 'acc_1',
    merchant: 'GitHub',
  },
];

function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SubscriptionsScreen() {
  // In production this will come from getAllSubscriptions() + detectSubscriptions()
  const [subscriptions] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS);

  const monthlyBleed = calculateMonthlyBleed(subscriptions);
  const unusedSubscriptions = findUnusedSubscriptions(subscriptions);
  const hasUnused = unusedSubscriptions.length > 0;
  const hasSubscriptions = subscriptions.length > 0;

  const annualCost = monthlyBleed * 12;

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
          <Text style={styles.headerTitle}>Subscriptions</Text>
          <Text style={styles.headerSubtitle}>
            {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Monthly bleed hero card */}
        <Card style={styles.bleedCard}>
          <Text style={styles.bleedLabel}>Monthly Bleed</Text>
          <Text style={styles.bleedAmount}>{formatCurrency(monthlyBleed)}</Text>
          <Text style={styles.bleedAnnual}>
            {formatCurrency(annualCost)} / year
          </Text>
          <View style={styles.bleedDivider} />
          <View style={styles.bleedMeta}>
            <View style={styles.bleedMetaItem}>
              <Text style={styles.bleedMetaValue}>{subscriptions.length}</Text>
              <Text style={styles.bleedMetaLabel}>Services</Text>
            </View>
            <View style={styles.bleedMetaSeparator} />
            <View style={styles.bleedMetaItem}>
              <Text
                style={[
                  styles.bleedMetaValue,
                  hasUnused && { color: colors.warning },
                ]}
              >
                {unusedSubscriptions.length}
              </Text>
              <Text style={styles.bleedMetaLabel}>Unused</Text>
            </View>
            <View style={styles.bleedMetaSeparator} />
            <View style={styles.bleedMetaItem}>
              <Text style={styles.bleedMetaValue}>
                {formatCurrency(
                  unusedSubscriptions.reduce((sum, s) => sum + s.amount, 0)
                )}
              </Text>
              <Text style={styles.bleedMetaLabel}>Waste</Text>
            </View>
          </View>
        </Card>

        {/* Unused subscription warning */}
        {hasUnused && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠</Text>
            <View style={styles.warningBody}>
              <Text style={styles.warningTitle}>
                {unusedSubscriptions.length} unused subscription
                {unusedSubscriptions.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.warningText}>
                {unusedSubscriptions.map((s) => s.name).join(', ')}{' '}
                {unusedSubscriptions.length === 1 ? 'hasn\'t' : 'haven\'t'} been used in over 30 days.
                Consider cancelling to save{' '}
                {formatCurrency(
                  unusedSubscriptions.reduce((sum, s) => sum + s.amount, 0)
                )}
                /mo.
              </Text>
            </View>
          </View>
        )}

        {/* Subscriptions list */}
        {hasSubscriptions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Subscriptions</Text>
            {subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>○</Text>
            <Text style={styles.emptyTitle}>No subscriptions detected</Text>
            <Text style={styles.emptySubtitle}>
              Connect a bank account and Vault will automatically detect recurring charges in your transaction history.
            </Text>
          </View>
        )}
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

  // Header
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

  // Monthly bleed card
  bleedCard: {
    margin: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  bleedLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  bleedAmount: {
    fontSize: 42,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  bleedAnnual: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bleedDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  bleedMeta: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  bleedMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  bleedMetaValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  bleedMetaLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bleedMetaSeparator: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  warningIcon: {
    fontSize: 18,
    color: colors.warning,
    marginTop: 1,
  },
  warningBody: {
    flex: 1,
    gap: spacing.xs,
  },
  warningTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.warning,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Section
  section: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
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
});
