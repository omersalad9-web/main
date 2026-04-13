// Vault — Onboarding Screen
// 3-page horizontal swiper to introduce the app's core value propositions.
// Shown once on first launch; completion is persisted to the local database.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { setPreference } from '../database/database';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';

interface Props {
  onComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPage {
  icon: string;
  title: string;
  subtitle: string;
}

const PAGES: OnboardingPage[] = [
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
    subtitle: 'AI-powered anomaly detection, running entirely on your phone.',
  },
];

export default function OnboardingScreen({ onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleGetStarted = async () => {
    await setPreference('has_completed_onboarding', 'true');
    onComplete();
  };

  const scrollToNext = () => {
    const next = activeIndex + 1;
    if (next < PAGES.length) {
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setActiveIndex(next);
    }
  };

  const isLastPage = activeIndex === PAGES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Page carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        scrollEventThrottle={16}
      >
        {PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.iconContainer}>
              <Text style={styles.pageIcon}>{page.icon}</Text>
            </View>
            <Text style={styles.pageTitle}>{page.title}</Text>
            <Text style={styles.pageSubtitle}>{page.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomSection}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        {isLastPage ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedLabel}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={scrollToNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextLabel}>Next</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.skipHint}>
          {isLastPage ? '' : 'Swipe to continue'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  pageIcon: {
    fontSize: 52,
    color: colors.gold,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.gold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.surfaceHighlight,
  },
  getStartedButton: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  getStartedLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.background,
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  nextLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  skipHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
