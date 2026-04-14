import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import Card from '../components/Card';
import SubscriptionRow from '../components/SubscriptionRow';
import SectionHeader from '../components/SectionHeader';
import { Subscription } from '../types';
import { calculateMonthlyBleed, findUnusedSubscriptions } from '../services/subscriptionDetector';

// ─── Demo data ────────────────────────────────────────────────────────────────

function makeSub(
  id: string,
  name: string,
  amount: number,
  daysSinceLastUse: number,
  daysUntilNext: number = 5,
): Subscription {
  const now = new Date();
  const lastCharge = new Date(now);
  lastCharge.setDate(lastCharge.getDate() - 15);
  const nextCharge = new Date(now);
  nextCharge.setDate(nextCharge.getDate() + daysUntilNext);

  return {
    id,
    name,
    amount,
    currency: 'GBP',
    frequency: 'monthly',
    lastChargeDate: lastCharge.toISOString(),
    nextChargeDate: nextCharge.toISOString(),
    isActive: true,
    daysSinceLastUse,
    accountId: '1',
    merchant: name,
  };
}

const DEMO_SUBSCRIPTIONS: Subscription[] = [
  makeSub('s1', 'Netflix', 15.99, 38),
  makeSub('s2', 'Spotify', 10.99, 2),
  makeSub('s3', 'Adobe', 54.99, 45),
  makeSub('s4', 'Icloud+', 2.99, 0),
  makeSub('s5', 'Amazon Prime', 8.99, 7),
  makeSub('s6', 'GitHub Copilot', 9.17, 1),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubscriptionsScreen: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS);

  const monthlyBleed = calculateMonthlyBleed(subscriptions);
  const unused = findUnusedSubscriptions(subscriptions);

  const handleDismissUnused = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
    );
  };

  const styles: Record<string, React.CSSProperties> = {
    screen: {
      width: '100%',
      height: '100vh',
      backgroundColor: colors.background,
      overflowY: 'auto',
      boxSizing: 'border-box',
    },
    inner: {
      maxWidth: 600,
      margin: '0 auto',
      padding: `${spacing.xl}px ${spacing.md}px ${spacing.xxl}px`,
      display: 'flex',
      flexDirection: 'column',
    },
    pageTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      margin: 0,
      marginBottom: spacing.lg,
    },
    // ── Bleed card ─────────────────────────────────────────────────
    bleedCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.xs,
      padding: spacing.lg,
    },
    bleedLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    bleedAmount: {
      fontSize: 42,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      letterSpacing: '-1px',
      lineHeight: 1.1,
    },
    bleedSubtext: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    bleedDivider: {
      height: 1,
      backgroundColor: colors.border,
      margin: `${spacing.md}px 0`,
    },
    bleedSavingsRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bleedSavingsLabel: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },
    bleedSavingsValue: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.positive,
    },
    // ── Warning banner ─────────────────────────────────────────────
    warningBanner: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: 'rgba(251,191,36,0.08)',
      border: `1px solid rgba(251,191,36,0.3)`,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      boxSizing: 'border-box',
    },
    warningIcon: {
      fontSize: 20,
      lineHeight: 1,
      flexShrink: 0,
      marginTop: 1,
    },
    warningContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.xs,
      flex: 1,
    },
    warningTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.warning,
    },
    warningBody: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    warningSavings: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.positive,
    },
  };

  const unusedTotal = unused.reduce((sum, s) => sum + s.amount, 0);
  const yearlyBleed = monthlyBleed * 12;

  return (
    <div style={styles.screen}>
      <div style={styles.inner}>
        <h1 style={styles.pageTitle}>Subscriptions</h1>

        {/* Monthly Bleed card */}
        <SectionHeader title="Monthly Bleed" />
        <Card style={{ marginBottom: spacing.md }}>
          <div style={styles.bleedCard}>
            <span style={styles.bleedLabel}>Total Monthly Cost</span>
            <span style={styles.bleedAmount}>
              £{monthlyBleed.toFixed(2)}
            </span>
            <span style={styles.bleedSubtext}>
              across {subscriptions.filter((s) => s.isActive).length} active subscriptions
            </span>
            <div style={styles.bleedDivider} />
            <div style={styles.bleedSavingsRow}>
              <span style={styles.bleedSavingsLabel}>Annual cost</span>
              <span
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.semibold,
                  color: colors.textPrimary,
                }}
              >
                £{yearlyBleed.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Unused warning */}
        {unused.length > 0 && (
          <div style={styles.warningBanner}>
            <span style={styles.warningIcon}>⚠️</span>
            <div style={styles.warningContent}>
              <span style={styles.warningTitle}>
                {unused.length} unused subscription{unused.length > 1 ? 's' : ''} detected
              </span>
              <span style={styles.warningBody}>
                {unused.map((s) => s.name).join(', ')} haven't been used in over 30 days.
              </span>
              <span style={styles.warningSavings}>
                Cancel to save £{unusedTotal.toFixed(2)}/mo
              </span>
            </div>
          </div>
        )}

        {/* Subscriptions list */}
        <SectionHeader title="All Subscriptions" />
        <Card>
          {subscriptions
            .filter((s) => s.isActive)
            .sort((a, b) => b.amount - a.amount)
            .map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
              />
            ))}
        </Card>

        {/* Cancelled placeholder */}
        {subscriptions.some((s) => !s.isActive) && (
          <>
            <SectionHeader title="Cancelled" />
            <Card>
              {subscriptions
                .filter((s) => !s.isActive)
                .map((sub) => (
                  <div
                    key={sub.id}
                    style={{ opacity: 0.4 }}
                  >
                    <SubscriptionRow subscription={sub} />
                  </div>
                ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsScreen;
