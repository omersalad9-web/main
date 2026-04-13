import React from 'react';
import { Subscription } from '../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface SubscriptionRowProps {
  subscription: Subscription;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

function formatFrequency(frequency: Subscription['frequency']): string {
  switch (frequency) {
    case 'weekly': return '/wk';
    case 'monthly': return '/mo';
    case 'yearly': return '/yr';
  }
}

const SubscriptionRow: React.FC<SubscriptionRowProps> = ({ subscription }) => {
  const isUnused = subscription.daysSinceLastUse >= 30;

  const styles: Record<string, React.CSSProperties> = {
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.sm}px 0`,
      gap: spacing.sm,
    },
    leftGroup: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
      overflow: 'hidden',
    },
    name: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      color: colors.textPrimary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    badge: {
      backgroundColor: 'rgba(251, 191, 36, 0.18)',
      color: colors.warning,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: spacing.xs + 2,
      paddingRight: spacing.xs + 2,
      borderRadius: borderRadius.full,
      whiteSpace: 'nowrap' as const,
      border: `1px solid rgba(251, 191, 36, 0.35)`,
      letterSpacing: '0.3px',
    },
    rightGroup: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 3,
    },
    amount: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
      whiteSpace: 'nowrap' as const,
    },
    frequency: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      color: colors.textMuted,
    },
  };

  return (
    <div style={styles.row}>
      <div style={styles.leftGroup}>
        <span style={styles.name}>{subscription.name}</span>
        {isUnused && (
          <span style={styles.badge}>
            Unused {subscription.daysSinceLastUse}d
          </span>
        )}
      </div>
      <div style={styles.rightGroup}>
        <span style={styles.amount}>
          {formatAmount(subscription.amount, subscription.currency)}
        </span>
        <span style={styles.frequency}>
          {formatFrequency(subscription.frequency)}
        </span>
      </div>
    </div>
  );
};

export default SubscriptionRow;
