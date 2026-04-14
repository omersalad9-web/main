import React from 'react';
import { AnomalyAlert } from '../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface AlertBannerProps {
  alert: AnomalyAlert;
  onDismiss: (id: string) => void;
}

const SEVERITY_STYLES: Record<
  AnomalyAlert['severity'],
  { background: string; border: string; labelColor: string; labelBg: string }
> = {
  high: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: 'rgba(248, 113, 113, 0.35)',
    labelColor: colors.negative,
    labelBg: 'rgba(248, 113, 113, 0.18)',
  },
  medium: {
    background: 'rgba(232, 184, 109, 0.1)',
    border: 'rgba(232, 184, 109, 0.35)',
    labelColor: colors.gold,
    labelBg: 'rgba(232, 184, 109, 0.18)',
  },
  low: {
    background: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.35)',
    labelColor: colors.info,
    labelBg: 'rgba(96, 165, 250, 0.18)',
  },
};

const TYPE_LABELS: Record<AnomalyAlert['type'], string> = {
  duplicate_charge: 'Duplicate Charge',
  spending_spike: 'Spending Spike',
  unknown_merchant: 'Unknown Merchant',
  unusual_amount: 'Unusual Amount',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const [dismissHovered, setDismissHovered] = React.useState(false);
  const theme = SEVERITY_STYLES[alert.severity];

  const styles: Record<string, React.CSSProperties> = {
    banner: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: theme.background,
      border: `1px solid ${theme.border}`,
      borderRadius: borderRadius.md,
      boxSizing: 'border-box',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: 6,
    },
    headerRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    typeLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: theme.labelColor,
      backgroundColor: theme.labelBg,
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: spacing.xs + 2,
      paddingRight: spacing.xs + 2,
      borderRadius: borderRadius.full,
      letterSpacing: '0.4px',
      textTransform: 'uppercase' as const,
    },
    severityDot: {
      width: 7,
      height: 7,
      borderRadius: borderRadius.full,
      backgroundColor: theme.labelColor,
      flexShrink: 0,
      marginTop: 1,
    },
    message: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    dismissButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      border: 'none',
      backgroundColor: dismissHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
      cursor: 'pointer',
      color: colors.textMuted,
      fontSize: 16,
      flexShrink: 0,
      transition: 'background-color 0.15s ease, color 0.15s ease',
      padding: 0,
      lineHeight: 1,
    },
  };

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <span style={styles.severityDot} />
          <span style={styles.typeLabel}>{TYPE_LABELS[alert.type]}</span>
        </div>
        <p style={{ ...styles.message, margin: 0 }}>{alert.message}</p>
      </div>
      <button
        style={styles.dismissButton}
        onClick={() => onDismiss(alert.id)}
        onMouseEnter={() => setDismissHovered(true)}
        onMouseLeave={() => setDismissHovered(false)}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
};

export default AlertBanner;
