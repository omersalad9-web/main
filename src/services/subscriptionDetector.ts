// Vault — Subscription detection engine
// Analyses transaction history to auto-detect recurring charges.
// All processing done on-device.

import type { Transaction, Subscription } from '../types';
import { APP_CONFIG } from '../constants/config';

interface RecurringPattern {
  merchant: string;
  amounts: number[];
  dates: string[];
  accountId: string;
  description: string;
}

// Detect recurring transactions by grouping similar merchant charges
export function detectSubscriptions(transactions: Transaction[]): Omit<Subscription, 'id'>[] {
  // Group transactions by merchant + similar amount
  const patterns = new Map<string, RecurringPattern>();

  const outgoing = transactions.filter((t) => t.amount < 0);

  for (const t of outgoing) {
    const merchantKey = normalizeMerchant(t.merchant);
    if (!merchantKey) continue;

    const existing = patterns.get(merchantKey);
    if (existing) {
      existing.amounts.push(Math.abs(t.amount));
      existing.dates.push(t.date);
    } else {
      patterns.set(merchantKey, {
        merchant: t.merchant,
        amounts: [Math.abs(t.amount)],
        dates: [t.date],
        accountId: t.accountId,
        description: t.description,
      });
    }
  }

  const subscriptions: Omit<Subscription, 'id'>[] = [];

  for (const [, pattern] of patterns) {
    if (pattern.dates.length < 2) continue;

    // Check if charges are roughly equal (within 20% variance)
    const avgAmount = pattern.amounts.reduce((a, b) => a + b, 0) / pattern.amounts.length;
    const isConsistentAmount = pattern.amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount < 0.2
    );
    if (!isConsistentAmount) continue;

    // Detect frequency from intervals between charges
    const sortedDates = pattern.dates
      .map((d) => new Date(d).getTime())
      .sort((a, b) => a - b);

    const intervals: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const frequency = detectFrequency(avgInterval);
    if (!frequency) continue;

    const lastChargeDate = new Date(sortedDates[sortedDates.length - 1]);
    const daysSinceLastCharge = Math.floor(
      (Date.now() - lastChargeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const nextChargeDate = new Date(lastChargeDate);
    if (frequency === 'weekly') nextChargeDate.setDate(nextChargeDate.getDate() + 7);
    else if (frequency === 'monthly') nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
    else nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1);

    subscriptions.push({
      name: prettifyMerchantName(pattern.merchant),
      amount: Math.round(avgAmount * 100) / 100,
      currency: 'GBP',
      frequency,
      lastChargeDate: lastChargeDate.toISOString(),
      nextChargeDate: nextChargeDate.toISOString(),
      isActive: true,
      daysSinceLastUse: daysSinceLastCharge,
      accountId: pattern.accountId,
      merchant: pattern.merchant,
    });
  }

  return subscriptions.sort((a, b) => b.amount - a.amount);
}

// Calculate total monthly cost of all active subscriptions
export function calculateMonthlyBleed(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.isActive)
    .reduce((total, s) => {
      switch (s.frequency) {
        case 'weekly': return total + s.amount * 4.33;
        case 'monthly': return total + s.amount;
        case 'yearly': return total + s.amount / 12;
        default: return total;
      }
    }, 0);
}

// Find subscriptions that haven't been used recently
export function findUnusedSubscriptions(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter(
    (s) => s.isActive && s.daysSinceLastUse >= APP_CONFIG.subscriptions.inactiveDaysThreshold
  );
}

function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function prettifyMerchantName(merchant: string): string {
  return merchant
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function detectFrequency(avgDays: number): 'weekly' | 'monthly' | 'yearly' | null {
  if (avgDays >= 5 && avgDays <= 10) return 'weekly';
  if (avgDays >= 25 && avgDays <= 38) return 'monthly';
  if (avgDays >= 340 && avgDays <= 400) return 'yearly';
  return null;
}
