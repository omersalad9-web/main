// Vault — Financial Health Score algorithm
// Calculates a daily score from 0-100 based on:
//   - Savings rate (30%)
//   - Debt ratio (25%)
//   - Spending trend (25%)
//   - Net worth trend (20%)
// All processing done on-device.

import { APP_CONFIG } from '../constants/config';
import type { HealthScore, Transaction, Account, NetWorthSnapshot } from '../types';

const { healthScore: weights } = APP_CONFIG;

// Clamp a value between 0 and 100
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// Calculate savings rate score (0-100)
// Higher savings rate = higher score
function calculateSavingsScore(transactions: Transaction[], _accounts: Account[]): number {
  if (transactions.length === 0) return 50;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = transactions.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo
  );

  const income = recentTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = recentTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (income === 0) return 30;

  const savingsRate = (income - expenses) / income;

  // Score: 0% savings = 20, 10% = 50, 20% = 70, 30%+ = 90+
  if (savingsRate <= 0) return 20;
  if (savingsRate >= 0.3) return 95;
  return clamp(20 + (savingsRate / 0.3) * 75);
}

// Calculate debt ratio score (0-100)
// Lower debt = higher score
function calculateDebtScore(accounts: Account[]): number {
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalDebt = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  if (totalBalance <= 0) return 30;
  if (totalDebt === 0) return 95;

  const debtRatio = totalDebt / (totalBalance + totalDebt);

  // Score: 0% debt = 95, 50% = 50, 100% = 10
  return clamp(95 - debtRatio * 85);
}

// Calculate spending trend score (0-100)
// Decreasing spending = higher score
function calculateSpendingTrendScore(transactions: Transaction[]): number {
  if (transactions.length < 14) return 50;

  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentSpending = transactions
    .filter((t) => new Date(t.date) >= twoWeeksAgo && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousSpending = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d >= fourWeeksAgo && d < twoWeeksAgo && t.amount < 0;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (previousSpending === 0) return 60;

  const changePercent = ((recentSpending - previousSpending) / previousSpending) * 100;

  // Decreased spending = good, increased = bad
  if (changePercent <= -20) return 90;
  if (changePercent <= -10) return 80;
  if (changePercent <= 0) return 70;
  if (changePercent <= 10) return 55;
  if (changePercent <= 20) return 40;
  return 25;
}

// Calculate net worth trend score (0-100)
// Growing net worth = higher score
function calculateNetWorthTrendScore(snapshots: NetWorthSnapshot[]): number {
  if (snapshots.length < 2) return 50;

  const latest = snapshots[snapshots.length - 1].total;
  const oldest = snapshots[0].total;

  if (oldest === 0) return latest > 0 ? 80 : 40;

  const changePercent = ((latest - oldest) / Math.abs(oldest)) * 100;

  if (changePercent >= 10) return 95;
  if (changePercent >= 5) return 85;
  if (changePercent >= 0) return 70;
  if (changePercent >= -5) return 50;
  if (changePercent >= -10) return 35;
  return 20;
}

// Main score calculator — combines all factors with weighted average
export function calculateHealthScore(
  transactions: Transaction[],
  accounts: Account[],
  netWorthHistory: NetWorthSnapshot[],
): HealthScore {
  const savingsRate = calculateSavingsScore(transactions, accounts);
  const debtRatio = calculateDebtScore(accounts);
  const spendingTrend = calculateSpendingTrendScore(transactions);
  const netWorthTrend = calculateNetWorthTrendScore(netWorthHistory);

  const overall = Math.round(
    savingsRate * weights.savingsWeight +
    debtRatio * weights.debtWeight +
    spendingTrend * weights.spendingWeight +
    netWorthTrend * weights.netWorthWeight
  );

  return {
    overall: clamp(overall),
    savingsRate,
    debtRatio,
    spendingTrend,
    netWorthTrend,
    calculatedAt: new Date().toISOString(),
  };
}
