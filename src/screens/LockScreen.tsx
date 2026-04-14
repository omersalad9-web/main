import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface LockScreenProps {
  onUnlock: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  // Subtle radial glow behind the logo
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    width: 320,
    height: 320,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(232,184,109,0.10) 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.lg,
    zIndex: 1,
    padding: `0 ${spacing.xl}px`,
  },
  logoMark: {
    fontSize: 48,
    lineHeight: 1,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  brandName: {
    fontSize: 52,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: '0.28em',
    lineHeight: 1,
    fontFamily: 'inherit',
  },
  tagline: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: '0.02em',
    lineHeight: 1.6,
    maxWidth: 280,
    marginTop: spacing.xs,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  unlockButton: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.xxl,
    paddingRight: spacing.xxl,
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.gold}`,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
    letterSpacing: '0.08em',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  unlockButtonHovered: {
    backgroundColor: colors.accentDim,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  footerIcon: {
    fontSize: 16,
    color: colors.textMuted,
    opacity: 0.6,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: '0.02em',
    opacity: 0.7,
  },
};

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.glow} />

      <div style={styles.content}>
        <span style={styles.logoMark}>◆</span>
        <span style={styles.brandName}>VAULT</span>
        <p style={{ ...styles.tagline, margin: 0 }}>
          Your money. Your device. Your rules.
        </p>
        <div style={styles.divider} />

        <button
          style={{
            ...styles.unlockButton,
            ...(btnHovered ? styles.unlockButtonHovered : {}),
          }}
          onClick={onUnlock}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          Unlock Vault
        </button>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerIcon}>🔒</span>
        <span style={styles.footerText}>No data leaves your device — ever.</span>
      </div>
    </div>
  );
};

export default LockScreen;
