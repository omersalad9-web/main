import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, fontSize, fontWeight } from '../constants/theme';

interface HealthRingProps {
  score: number; // 0–100
  size?: number;
  strokeWidth?: number;
}

const SCORE_COLOR = (score: number): string => {
  if (score <= 40) return '#F87171';
  if (score <= 70) return '#E8B86D';
  return '#4ADE80';
};

const SCORE_LABEL = (score: number): string => {
  if (score <= 40) return 'At Risk';
  if (score <= 70) return 'Fair';
  return 'Healthy';
};

// Animated wrapper around react-native-svg Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function HealthRing({ score, size = 140, strokeWidth = 10 }: HealthRingProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const ringColor = SCORE_COLOR(clampedScore);
  const label = SCORE_LABEL(clampedScore);

  // Animate the stroke-dashoffset from fully hidden → target
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: clampedScore,
      duration: 900,
      useNativeDriver: false, // SVG props can't use native driver
    }).start();
  }, [clampedScore]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Rotate so the arc starts at 12 o'clock */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Track ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surfaceHighlight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center text overlay */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.scoreText, { color: ringColor }]}>
          {clampedScore}
        </Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxl * 1.2,
  },
  labelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

export default HealthRing;
