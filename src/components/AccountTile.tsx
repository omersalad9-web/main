import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Account } from '../types';
import Card from './Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';

interface AccountTileProps {
  account: Account;
  onPress?: () => void;
}

const TYPE_ICON: Record<string, string> = {
  bank: '🏦',
  crypto: '₿',
  investment: '📈',
};

function formatBalance(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function AccountTile({ account, onPress }: AccountTileProps) {
  const { name, provider, balance, currency, type } = account;
  const iconGlyph = TYPE_ICON[type] ?? '💳';
  const isNegative = balance < 0;

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Icon area */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{iconGlyph}</Text>
      </View>

      {/* Name + provider */}
      <View style={styles.info}>
        <Text style={styles.accountName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.providerName} numberOfLines={1}>
          {provider}
        </Text>
      </View>

      {/* Balance */}
      <Text style={[styles.balance, isNegative && styles.balanceNegative]}>
        {formatBalance(balance, currency)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: fontSize.lg,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  accountName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  providerName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  balance: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  balanceNegative: {
    color: colors.negative,
  },
});

export default AccountTile;
