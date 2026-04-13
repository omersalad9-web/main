import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnomalyAlert } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';

interface AlertBannerProps {
  alert: AnomalyAlert;
  onDismiss: (id: string) => void;
}

type SeverityStyle = {
  background: string;
  border: string;
  iconColor: string;
  icon: string;
};

const SEVERITY_STYLES: Record<AnomalyAlert['severity'], SeverityStyle> = {
  high: {
    background: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(248, 113, 113, 0.35)',
    iconColor: '#F87171',
    icon: '⚠',
  },
  medium: {
    background: 'rgba(232, 184, 109, 0.12)',
    border: 'rgba(232, 184, 109, 0.35)',
    iconColor: '#E8B86D',
    icon: '◆',
  },
  low: {
    background: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.35)',
    iconColor: '#60A5FA',
    icon: 'ℹ',
  },
};

const TYPE_LABEL: Record<AnomalyAlert['type'], string> = {
  duplicate_charge: 'Duplicate Charge',
  spending_spike: 'Spending Spike',
  unknown_merchant: 'Unknown Merchant',
  unusual_amount: 'Unusual Amount',
};

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const { id, type, message, severity } = alert;
  const theme = SEVERITY_STYLES[severity];
  const typeLabel = TYPE_LABEL[type];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Icon */}
      <Text style={[styles.icon, { color: theme.iconColor }]}>{theme.icon}</Text>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.typeLabel, { color: theme.iconColor }]}>
          {typeLabel}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {/* Dismiss button */}
      <Pressable
        onPress={() => onDismiss(id)}
        style={({ pressed }: { pressed: boolean }) => [styles.dismissButton, pressed && styles.dismissPressed]}
        hitSlop={8}
        accessibilityLabel="Dismiss alert"
        accessibilityRole="button"
      >
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.4,
    width: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
  },
  dismissButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dismissPressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  dismissText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.4,
  },
});

export default AlertBanner;
