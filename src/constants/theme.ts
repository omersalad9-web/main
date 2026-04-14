// Vault — Design tokens
// Dark mode first. Premium, minimal, trustworthy.

export const colors = {
  // Core palette
  navy: '#0F3460',
  nearBlack: '#1A1A2E',
  gold: '#E8B86D',
  white: '#FAFAFA',

  // Background layers
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceElevated: '#232340',
  surfaceHighlight: '#2A2A4A',

  // Text
  textPrimary: '#FAFAFA',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',

  // Status
  positive: '#4ADE80',
  negative: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  // Accent
  accent: '#E8B86D',
  accentDim: 'rgba(232, 184, 109, 0.15)',

  // Borders
  border: '#2A2A4A',
  borderLight: 'rgba(255, 255, 255, 0.06)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
