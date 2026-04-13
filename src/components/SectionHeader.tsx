import React, { useState } from 'react';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAll }) => {
  const [hovered, setHovered] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.textMuted,
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
    },
    seeAll: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: hovered ? '#d4a355' : colors.gold,
      cursor: 'pointer',
      textDecoration: 'none',
      letterSpacing: '0.2px',
      transition: 'color 0.15s ease',
      background: 'none',
      border: 'none',
      padding: 0,
    },
  };

  return (
    <div style={styles.row}>
      <span style={styles.title}>{title}</span>
      {onSeeAll && (
        <button
          style={styles.seeAll}
          onClick={onSeeAll}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          See all
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
