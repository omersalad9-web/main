import React from 'react';
import { Account } from '../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface AccountTileProps {
  account: Account;
  onClick?: () => void;
}

function formatBalance(amount: number, currency: string): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

const AccountTile: React.FC<AccountTileProps> = ({ account, onClick }) => {
  const [hovered, setHovered] = React.useState(false);

  const styles: Record<string, React.CSSProperties> = {
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: `${spacing.sm}px 0`,
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: borderRadius.sm,
      transition: 'opacity 0.15s ease',
      opacity: hovered && onClick ? 0.75 : 1,
    },
    iconBox: {
      width: 42,
      height: 42,
      minWidth: 42,
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.sm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      border: `1px solid ${colors.border}`,
    },
    textColumn: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: 2,
      overflow: 'hidden',
    },
    accountName: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    providerName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      color: colors.textMuted,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    balance: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: account.balance < 0 ? colors.negative : colors.textPrimary,
      whiteSpace: 'nowrap' as const,
    },
  };

  const defaultIcon = account.type === 'bank' ? '🏦' : account.type === 'crypto' ? '₿' : '📈';

  return (
    <div
      style={styles.row}
      onClick={onClick}
      onMouseEnter={onClick ? () => setHovered(true) : undefined}
      onMouseLeave={onClick ? () => setHovered(false) : undefined}
    >
      <div style={styles.iconBox}>
        <span>{account.icon ?? defaultIcon}</span>
      </div>
      <div style={styles.textColumn}>
        <span style={styles.accountName}>{account.name}</span>
        <span style={styles.providerName}>{account.provider}</span>
      </div>
      <span style={styles.balance}>
        {formatBalance(account.balance, account.currency)}
      </span>
    </div>
  );
};

export default AccountTile;
