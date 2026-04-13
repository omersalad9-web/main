import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !isDisabled && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.nearBlack : colors.gold}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' ? styles.labelPrimary : styles.labelSecondary,
            isDisabled && styles.labelDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Primary — solid gold background
  primary: {
    backgroundColor: colors.gold,
  },
  primaryPressed: {
    backgroundColor: '#D4A45A',
  },
  // Secondary — transparent with gold border
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  secondaryPressed: {
    backgroundColor: colors.accentDim,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  labelPrimary: {
    fontWeight: fontWeight.bold,
    color: colors.nearBlack,
  },
  labelSecondary: {
    fontWeight: fontWeight.semibold,
    color: colors.gold,
  },
  labelDisabled: {
    opacity: 0.7,
  },
});

export default Button;
