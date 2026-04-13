import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Subscription } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';

interface SubscriptionRowProps {
  subscription: Subscription;
}

const FREQUENCY_LABEL: Record<Subscription['frequency'], string> = {
  weekly: '/ week',
  monthly: '/ mo',
  yearly: '/ yr',
};

function formatAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function SubscriptionRow({ subscription }: SubscriptionRowProps) {
  const { name, amount, currency, frequency, daysSinceLastUse, isActive } = subscription;
  const showWarning = daysSinceLastUse >= 30;
  const frequencyLabel = FREQUENCY_LABEL[frequency];

  return (
    <View style={[styles.row, !isActive && styles.rowInactive]}>
      {/* Left — name + warning badge */}
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {showWarning && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>Unused {daysSinceLastUse}d</Text>
          </View>
        )}
      </View>

      {/* Right — amount + frequency */}
      <View style={styles.right}>
        <Text style={styles.amount}>
          {formatAmount(amount, currency)}
        </Text>
        <Text style={styles.frequency}>{frequencyLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowInactive: {
    opacity: 0.5,
  },
  left: {
    flex: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  warningBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  warningText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.warning,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  frequency: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default SubscriptionRow;
