import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import Card from '../components/Card';
import HealthRing from '../components/HealthRing';
import NetWorthChart from '../components/NetWorthChart';
import AlertBanner from '../components/AlertBanner';
import SectionHeader from '../components/SectionHeader';
import { NetWorthSnapshot, AnomalyAlert } from '../types';

// ─── Demo data ────────────────────────────────────────────────────────────────

function generateNetWorthData(): NetWorthSnapshot[] {
  const snapshots: NetWorthSnapshot[] = [];
  const today = new Date();
  let base = 42000;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    // Slight daily growth with noise
    const noise = (Math.random() - 0.4) * 400;
    base = Math.max(40000, base + noise + 80);

    snapshots.push({
      date: d.toISOString().split('T')[0],
      total: Math.round(base),
      breakdown: {
        banking: Math.round(base * 0.094),
        crypto: Math.round(base * 0.28),
        investments: Math.round(base * 0.626),
      },
    });
  }

  return snapshots;
}

const DEMO_NET_WORTH_DATA = generateNetWorthData();

const DEMO_ALERTS: AnomalyAlert[] = [
  {
    id: 'a1',
    transactionId: 't1',
    type: 'duplicate_charge',
    message: 'Netflix charged you twice on 10 Apr — £15.99 appears twice within 24 hours.',
    severity: 'high',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    transactionId: 't2',
    type: 'spending_spike',
    message: 'Your spending this week is 42% higher than your monthly average.',
    severity: 'medium',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a3',
    transactionId: 't3',
    type: 'unknown_merchant',
    message: 'Unrecognised charge of £28.50 from "MXPMT*3XB7Q" — verify this transaction.',
    severity: 'low',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

const HEALTH_BARS = [
  { label: 'Savings Rate', score: 78, color: colors.positive },
  { label: 'Debt Management', score: 85, color: colors.positive },
  { label: 'Spending Trend', score: 55, color: colors.gold },
  { label: 'Net Worth Growth', score: 68, color: colors.gold },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

const InsightsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(DEMO_ALERTS);

  const dismissAlert = (id: string) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

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
    // ── Chart card ─────────────────────────────────────────────────
    chartCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    chartHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    chartTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    chartPeriod: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      backgroundColor: colors.surfaceElevated,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.sm,
      padding: `${spacing.xs}px ${spacing.sm}px`,
    },
    // ── Health section ─────────────────────────────────────────────
    healthRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
      padding: spacing.md,
    },
    barsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.md,
      flex: 1,
    },
    barRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.xs,
    },
    barMeta: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    barLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
    },
    barValue: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    barTrack: {
      height: 6,
      backgroundColor: colors.surfaceHighlight,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    // ── Alerts ─────────────────────────────────────────────────────
    alertsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.sm,
    },
    noAlerts: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${spacing.xl}px`,
      gap: spacing.sm,
    },
    noAlertsIcon: {
      fontSize: 32,
    },
    noAlertsText: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
  };

  const lastSnapshot = DEMO_NET_WORTH_DATA[DEMO_NET_WORTH_DATA.length - 1];

  return (
    <div style={styles.screen}>
      <div style={styles.inner}>
        <h1 style={styles.pageTitle}>Insights</h1>

        {/* Net Worth Timeline */}
        <SectionHeader title="Net Worth Timeline" />
        <Card style={{ marginBottom: spacing.md, overflow: 'hidden' }}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div>
                <div style={styles.chartTitle}>
                  £{lastSnapshot.total.toLocaleString('en-GB')}
                </div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                  Current net worth
                </div>
              </div>
              <span style={styles.chartPeriod}>30 days</span>
            </div>
            <NetWorthChart
              data={DEMO_NET_WORTH_DATA}
              width={520}
              height={160}
            />
          </div>
        </Card>

        {/* Financial Health */}
        <SectionHeader title="Financial Health" />
        <Card style={{ marginBottom: spacing.md }}>
          <div style={styles.healthRow}>
            <HealthRing score={72} size={110} />
            <div style={styles.barsContainer}>
              {HEALTH_BARS.map(({ label, score, color }) => (
                <div key={label} style={styles.barRow}>
                  <div style={styles.barMeta}>
                    <span style={styles.barLabel}>{label}</span>
                    <span style={{ ...styles.barValue, color }}>{score}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        height: '100%',
                        width: `${score}%`,
                        backgroundColor: color,
                        borderRadius: borderRadius.full,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <SectionHeader title="Alerts" />
        {alerts.length === 0 ? (
          <Card>
            <div style={styles.noAlerts}>
              <span style={styles.noAlertsIcon}>✓</span>
              <span style={styles.noAlertsText}>
                No alerts — everything looks normal.
              </span>
            </div>
          </Card>
        ) : (
          <div style={styles.alertsList}>
            {alerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsScreen;
