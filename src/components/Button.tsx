import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.15s ease, opacity 0.15s ease, transform 0.1s ease',
    userSelect: 'none' as const,
    letterSpacing: '0.2px',
    opacity: disabled ? 0.45 : 1,
    transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    boxSizing: 'border-box' as const,
  };

  const primaryStyle: React.CSSProperties = {
    backgroundColor: hovered && !disabled ? '#d4a355' : colors.gold,
    color: colors.nearBlack,
    border: 'none',
  };

  const secondaryStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: hovered && !disabled ? '#d4a355' : colors.gold,
    border: `1.5px solid ${hovered && !disabled ? '#d4a355' : colors.gold}`,
  };

  const variantStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button
      style={{ ...base, ...variantStyle, ...style }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
