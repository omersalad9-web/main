import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import Card from '../components/Card';
import HealthRing from '../components/HealthRing';
import AccountTile from '../components/AccountTile';
import SectionHeader from '../components/SectionHeader';
import { Account } from '../types';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Barclays Current',
    type: 'bank',
    provider: 'Barclays',
    balance: 4250.80,
    currency: 'GBP',
    lastSynced: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bitcoin Wallet',
    type: 'crypto',
    provider: 'Coinbase',
    balance: 12680.00,
    currency: 'GBP',
    lastSynced: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Stocks & Shares ISA',
    type: 'investment',
    provider: 'Trading 212',
    balance: 28450.00,
    currency: 'GBP',
    lastSynced: new Date().toISOString(),
  },
];

const DEMO_TRANSACTIONS = [
  { id: 't1', merchant: 'Tesco Express', amount: -24.60, date: '2026-04-12', category: 'Groceries' },
  { id: 't2', merchant: 'Employer Ltd', amount: 3200.00, date: '2026-04-11', category: 'Income' },
  { id: 't3', merchant: 'Netflix', amount: -15.99, date: '2026-04-10', category: 'Entertainment' },
  { id: 't4', merchant: 'TfL Contactless', amount: -4.80, date: '2026-04-09', category: 'Transport' },
  { id: 't5', merchant: 'Deliveroo', amount: -32.50, date: '2026-04-08', category: 'Food & Drink' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGBP(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${amount < 0 ? '-' : ''}£${formatted}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
  const [accounts] = useState<Account[]>(DEMO_ACCOUNTS);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const bankTotal = accounts.filter((a) => a.type === 'bank').reduce((s, a) => s + a.balance, 0);
  const cryptoTotal = accounts.filter((a) => a.type === 'crypto').reduce((s, a) => s + a.balance, 0);
  const investTotal = accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + a.balance, 0);

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
      gap: 0,
    },
    // ── Header bar ─────────────────────────────────────────────────
    headerBar: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    brand: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.gold,
      letterSpacing: '0.18em',
    },
    avatarBtn: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: colors.accentDim,
      border: `1.5px solid ${colors.gold}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: colors.gold,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    // ── Hero ───────────────────────────────────────────────────────
    heroSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    heroLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
    },
    heroAmount: {
      fontSize: 44,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      letterSpacing: '-1px',
      lineHeight: 1.1,
    },
    changeRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    changePill: {
      backgroundColor: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.28)',
      borderRadius: borderRadius.full,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: spacing.sm,
      paddingRight: spacing.sm,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    changeText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.positive,
    },
    changePeriod: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },
    // ── Health ─────────────────────────────────────────────────────
    healthCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
      padding: spacing.lg,
    },
    healthInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.sm,
      flex: 1,
    },
    healthTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    healthDesc: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    healthViewBtn: {
      marginTop: spacing.xs,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.gold,
      textAlign: 'left' as const,
    },
    // ── Breakdown ──────────────────────────────────────────────────
    breakdownCard: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    breakdownCol: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 1,
    },
    breakdownDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: colors.border,
    },
    breakdownLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
    },
    breakdownAmount: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    breakdownType: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    // ── Transactions ───────────────────────────────────────────────
    txRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing.sm + 2,
      paddingBottom: spacing.sm + 2,
      borderBottom: `1px solid ${colors.border}`,
    },
    txIconBox: {
      width: 40,
      height: 40,
      minWidth: 40,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surfaceElevated,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },
    txMeta: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: 2,
      overflow: 'hidden',
    },
    txMerchant: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      color: colors.textPrimary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    txCategory: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    txRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 2,
    },
  };

  const txIcons: Record<string, string> = {
    Groceries: '🛒',
    Income: '💰',
    Entertainment: '🎬',
    Transport: '🚇',
    'Food & Drink': '🍔',
  };

  return (
    <div style={styles.screen}>
      <div style={styles.inner}>
        {/* Header bar */}
        <div style={styles.headerBar}>
          <span style={styles.brand}>VAULT</span>
          <div style={styles.avatarBtn}>V</div>
        </div>

        {/* Hero — Net Worth */}
        <div style={styles.heroSection}>
          <span style={styles.heroLabel}>Total Net Worth</span>
          <span style={styles.heroAmount}>{formatGBP(netWorth)}</span>
          <div style={styles.changeRow}>
            <div style={styles.changePill}>
              <span style={{ color: colors.positive, fontSize: 14, lineHeight: 1 }}>▲</span>
              <span style={styles.changeText}>£1,240.50</span>
            </div>
            <span style={styles.changePeriod}>this month</span>
          </div>
        </div>

        {/* Health Score */}
        <SectionHeader title="Financial Health" />
        <Card style={{ marginBottom: spacing.md }}>
          <div style={styles.healthCard}>
            <HealthRing score={72} size={100} />
            <div style={styles.healthInfo}>
              <span style={styles.healthTitle}>Your score is Fair</span>
              <span style={styles.healthDesc}>
                Good debt management. Savings rate could be improved.
              </span>
              <button style={styles.healthViewBtn}>View breakdown →</button>
            </div>
          </div>
        </Card>

        {/* Breakdown */}
        <SectionHeader title="Breakdown" />
        <Card style={{ marginBottom: spacing.md }}>
          <div style={styles.breakdownCard}>
            <div style={styles.breakdownCol}>
              <span style={styles.breakdownLabel}>Banking</span>
              <span style={styles.breakdownAmount}>{formatGBP(bankTotal)}</span>
              <span style={styles.breakdownType}>1 account</span>
            </div>
            <div style={styles.breakdownDivider} />
            <div style={styles.breakdownCol}>
              <span style={styles.breakdownLabel}>Crypto</span>
              <span style={styles.breakdownAmount}>{formatGBP(cryptoTotal)}</span>
              <span style={styles.breakdownType}>1 wallet</span>
            </div>
            <div style={styles.breakdownDivider} />
            <div style={styles.breakdownCol}>
              <span style={styles.breakdownLabel}>Investments</span>
              <span style={styles.breakdownAmount}>{formatGBP(investTotal)}</span>
              <span style={styles.breakdownType}>1 account</span>
            </div>
          </div>
        </Card>

        {/* Accounts */}
        <SectionHeader title="Your Accounts" onSeeAll={() => {}} />
        <Card style={{ marginBottom: spacing.md }}>
          {accounts.map((acc, i) => (
            <div
              key={acc.id}
              style={
                i < accounts.length - 1
                  ? { borderBottom: `1px solid ${colors.border}` }
                  : {}
              }
            >
              <AccountTile account={acc} />
            </div>
          ))}
        </Card>

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" onSeeAll={() => {}} />
        <Card>
          {DEMO_TRANSACTIONS.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                ...styles.txRow,
                borderBottom:
                  i < DEMO_TRANSACTIONS.length - 1
                    ? `1px solid ${colors.border}`
                    : 'none',
              }}
            >
              <div style={styles.txIconBox}>
                <span>{txIcons[tx.category] ?? '💳'}</span>
              </div>
              <div style={styles.txMeta}>
                <span style={styles.txMerchant}>{tx.merchant}</span>
                <span style={styles.txCategory}>{tx.category}</span>
              </div>
              <div style={styles.txRight}>
                <span
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.semibold,
                    color: tx.amount >= 0 ? colors.positive : colors.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {formatGBP(tx.amount)}
                </span>
                <span style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                  {formatDate(tx.date)}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
