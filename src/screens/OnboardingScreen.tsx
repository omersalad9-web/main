import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Page {
  icon: string;
  title: string;
  subtitle: string;
}

const PAGES: Page[] = [
  {
    icon: '◆',
    title: 'All Your Finances',
    subtitle: 'Bank accounts, crypto, investments — one unified view.',
  },
  {
    icon: '◇',
    title: 'Privacy First',
    subtitle: 'Your data never leaves your device. Ever.',
  },
  {
    icon: '○',
    title: 'Smart Alerts',
    subtitle: 'AI-powered anomaly detection, running entirely on your device.',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activePage, setActivePage] = useState(0);
  const [btnHovered, setBtnHovered] = useState(false);

  const page = PAGES[activePage];
  const isLast = activePage === PAGES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setActivePage((p) => p + 1);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      width: '100%',
      height: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.xxl}px ${spacing.xl}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    topSpacer: {
      flex: 1,
    },
    glow: {
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 300,
      height: 300,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(232,184,109,0.08) 0%, transparent 70%)`,
      pointerEvents: 'none',
    },
    pageContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.xl,
      flex: 2,
      justifyContent: 'center',
      zIndex: 1,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.accentDim,
      border: `1.5px solid rgba(232,184,109,0.3)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 44,
      color: colors.gold,
      lineHeight: 1,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: '-0.3px',
    },
    subtitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 1.6,
      maxWidth: 300,
    },
    bottomSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.xl,
      width: '100%',
      maxWidth: 360,
    },
    dotsRow: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center',
    },
    nextButton: {
      width: '100%',
      paddingTop: spacing.md + 2,
      paddingBottom: spacing.md + 2,
      backgroundColor: isLast ? colors.gold : 'transparent',
      border: `1.5px solid ${colors.gold}`,
      borderRadius: borderRadius.full,
      cursor: 'pointer',
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: isLast ? colors.background : colors.gold,
      letterSpacing: '0.05em',
      transition: 'opacity 0.2s ease, background-color 0.2s ease',
      opacity: btnHovered ? 0.85 : 1,
    },
    skipRow: {
      display: 'flex',
      justifyContent: 'center',
    },
    skipBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: fontSize.sm,
      color: colors.textMuted,
      padding: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.glow} />

      <div style={styles.topSpacer} />

      <div style={styles.pageContent}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{page.icon}</span>
        </div>
        <span style={styles.title}>{page.title}</span>
        <p style={{ ...styles.subtitle, margin: 0 }}>{page.subtitle}</p>
      </div>

      <div style={styles.bottomSection}>
        {/* Dot indicators */}
        <div style={styles.dotsRow}>
          {PAGES.map((_, i) => (
            <div
              key={i}
              onClick={() => setActivePage(i)}
              style={{
                width: i === activePage ? 24 : 8,
                height: 8,
                borderRadius: borderRadius.full,
                backgroundColor: i === activePage ? colors.gold : colors.textMuted,
                opacity: i === activePage ? 1 : 0.4,
                cursor: 'pointer',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </div>

        <button
          style={styles.nextButton}
          onClick={handleNext}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>

        {!isLast && (
          <div style={styles.skipRow}>
            <button style={styles.skipBtn} onClick={onComplete}>
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
