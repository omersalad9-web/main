// Vault — Insights Screen
// Net worth timeline, health score breakdown, and anomaly alerts.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import HealthRing from '../components/HealthRing';
import NetWorthChart from '../components/NetWorthChart';
import AlertBanner from '../components/AlertBanner';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import type { NetWorthSnapshot, AnomalyAlert } from '../types';

// Generate sample net worth data for the chart
function generateSampleHistory(): NetWorthSnapshot[] {
  const data: NetWorthSnapshot[] = [];
  let total = 42000;
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    total += (Math.random() - 0.35) * 800;
    total = Math.max(total, 38000);

    data.push({
      date: date.toISOString().split('T')[0],
      total: Math.round(total * 100) / 100,
      breakdown: {
        banking: Math.round(total * 0.55 * 100) / 100,
        crypto: Math.round(total * 0.25 * 100) / 100,
        investments: Math.round(total * 0.20 * 100) / 100,
      },
    });
  }
  return data;
}

const SAMPLE_ALERTS: AnomalyAlert[] = [
  {
    id: 'alert-1',
    transactionId: 'tx-1',
    type: 'duplicate_charge',
    message: 'Possible duplicate: Amazon charged £29.99 twice within 24 hours.',
    severity: 'high',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    transactionId: 'tx-2',
    type: 'spending_spike',
    message: 'Spending spike yesterday: £342.00 spent (280% of your daily average).',
    severity: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'alert-3',
    transactionId: 'tx-3',
    type: 'unknown_merchant',
    message: 'New merchant: £67.50 charged by "DGTL Services Ltd" — first time seeing this merchant.',
    severity: 'low',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function InsightsScreen() {
  const sampleHistory = useMemo(() => generateSampleHistory(), []);
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);

  const healthScore = 72;
  const scoreBreakdown = [
    { label: 'Savings Rate', score: 78, color: colors.positive },
    { label: 'Debt Ratio', score: 85, color: colors.positive },
    { label: 'Spending Trend', score: 55, color: colors.warning },
    { label: 'Net Worth Trend', score: 68, color: colors.gold },
  ];

  function handleDismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>

        {/* Net Worth Timeline */}
        <View style={styles.section}>
          <SectionHeader title="Net Worth Timeline" />
          <Card style={styles.chartCard}>
            <NetWorthChart data={sampleHistory} width={320} height={180} />
          </Card>
        </View>

        {/* Financial Health */}
        <View style={styles.section}>
          <SectionHeader title="Financial Health" />
          <Card style={styles.healthCard}>
            <View style={styles.healthRow}>
              <HealthRing score={healthScore} size={100} strokeWidth={8} />
              <View style={styles.healthBreakdown}>
                {scoreBreakdown.map((item) => (
                  <View key={item.label} style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>{item.label}</Text>
                    <View style={styles.scoreBarContainer}>
                      <View
                        style={[
                          styles.scoreBar,
                          { width: `${item.score}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.scoreValue, { color: item.color }]}>
                      {item.score}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <SectionHeader title={`Alerts (${alerts.length})`} />
          {alerts.length > 0 ? (
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <AlertBanner
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </View>
          ) : (
            <Card>
              <Text style={styles.noAlerts}>All clear — no anomalies detected.</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  chartCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  healthCard: {
    padding: spacing.lg,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  healthBreakdown: {
    flex: 1,
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 90,
  },
  scoreBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    width: 28,
    textAlign: 'right',
  },
  alertsList: {
    gap: spacing.sm,
  },
  noAlerts: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
