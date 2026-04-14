import React from 'react';
import { colors, spacing, fontSize, fontWeight } from '../constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${spacing.xxl}px ${spacing.xl}px`,
      textAlign: 'center',
      gap: spacing.sm,
    },
    icon: {
      fontSize: 48,
      lineHeight: 1,
      marginBottom: spacing.sm,
      userSelect: 'none' as const,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
      margin: 0,
    },
    subtitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      color: colors.textMuted,
      margin: 0,
      maxWidth: 260,
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon} role="img" aria-hidden="true">
        {icon}
      </span>
      <p style={styles.title}>{title}</p>
      <p style={styles.subtitle}>{subtitle}</p>
    </div>
  );
};

export default EmptyState;
