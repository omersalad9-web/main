import React from 'react';
import { colors, fontSize, fontWeight } from '../constants/theme';

interface HealthRingProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score <= 40) return colors.negative;
  if (score <= 70) return colors.gold;
  return colors.positive;
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'At Risk';
  if (score <= 70) return 'Fair';
  return 'Healthy';
}

const HealthRing: React.FC<HealthRingProps> = ({ score, size = 140 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = size * 0.07;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const trackColor = colors.surfaceHighlight;
  const ringColor = getScoreColor(clampedScore);
  const label = getScoreLabel(clampedScore);
  const cx = size / 2;
  const cy = size / 2;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size,
      height: size,
    },
    svg: {
      transform: 'rotate(-90deg)',
      display: 'block',
    },
    textContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    scoreText: {
      fontSize: size * 0.22,
      fontWeight: fontWeight.bold,
      color: ringColor,
      lineHeight: 1,
      letterSpacing: '-0.5px',
    },
    labelText: {
      fontSize: size * 0.1,
      fontWeight: fontWeight.medium,
      color: colors.textSecondary,
      marginTop: size * 0.03,
      letterSpacing: '0.5px',
      textTransform: 'uppercase' as const,
    },
  };

  return (
    <div style={styles.container}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        {/* Track circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div style={styles.textContainer}>
        <span style={styles.scoreText}>{clampedScore}</span>
        <span style={styles.labelText}>{label}</span>
      </div>
    </div>
  );
};

export default HealthRing;
