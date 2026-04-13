import React, { useState } from 'react';
import { colors, spacing, borderRadius } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const baseStyle: React.CSSProperties = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.md,
  padding: spacing.md,
  boxSizing: 'border-box',
};

const Card: React.FC<CardProps> = ({ children, style, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const interactiveStyle: React.CSSProperties = onClick
    ? {
        cursor: 'pointer',
        backgroundColor: hovered ? colors.surfaceElevated : colors.surface,
        transition: 'background-color 0.15s ease',
      }
    : {};

  return (
    <div
      style={{ ...baseStyle, ...interactiveStyle, ...style }}
      onClick={onClick}
      onMouseEnter={onClick ? () => setHovered(true) : undefined}
      onMouseLeave={onClick ? () => setHovered(false) : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
