import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          style={({ pressed }: { pressed: boolean }) => [styles.seeAllButton, pressed && styles.seeAllPressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  seeAllButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gold,
  },
});

export default SectionHeader;
