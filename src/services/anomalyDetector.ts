// Vault — On-device anomaly detection
// Flags duplicate charges, spending spikes, and unknown merchants.
// All processing done locally — no data leaves device.

import type { Transaction, AnomalyAlert } from '../types';

type AlertWithoutMeta = Omit<AnomalyAlert, 'id' | 'createdAt'>;

// Main detection pipeline — runs all checks against recent transactions
export function detectAnomalies(
  transactions: Transaction[],
  historicalTransactions: Transaction[],
): AlertWithoutMeta[] {
  const alerts: AlertWithoutMeta[] = [];

  alerts.push(...detectDuplicateCharges(transactions));
  alerts.push(...detectSpendingSpikes(transactions, historicalTransactions));
  alerts.push(...detectUnknownMerchants(transactions, historicalTransactions));
  alerts.push(...detectUnusualAmounts(transactions, historicalTransactions));

  return alerts;
}

// Detect duplicate charges — same merchant, same amount, within 48 hours
function detectDuplicateCharges(transactions: Transaction[]): AlertWithoutMeta[] {
  const alerts: AlertWithoutMeta[] = [];
  const outgoing = transactions.filter((t) => t.amount < 0);

  for (let i = 0; i < outgoing.length; i++) {
    for (let j = i + 1; j < outgoing.length; j++) {
      const a = outgoing[i];
      const b = outgoing[j];

      if (
        a.merchant === b.merchant &&
        Math.abs(a.amount) === Math.abs(b.amount) &&
        Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) < 48 * 60 * 60 * 1000
      ) {
        alerts.push({
          transactionId: b.id,
          type: 'duplicate_charge',
          message: `Possible duplicate: ${a.merchant} charged £${Math.abs(b.amount).toFixed(2)} twice within 48 hours.`,
          severity: 'high',
          isRead: false,
        });
      }
    }
  }

  return alerts;
}

// Detect spending spikes — daily spend significantly above average
function detectSpendingSpikes(
  recentTransactions: Transaction[],
  historicalTransactions: Transaction[],
): AlertWithoutMeta[] {
  const alerts: AlertWithoutMeta[] = [];

  // Calculate average daily spend from history
  const historicalOutgoing = historicalTransactions.filter((t) => t.amount < 0);
  if (historicalOutgoing.length < 7) return alerts;

  const dates = new Set(historicalOutgoing.map((t) => t.date.split('T')[0]));
  const totalSpend = historicalOutgoing.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const avgDailySpend = totalSpend / Math.max(dates.size, 1);

  // Group recent transactions by day
  const dailySpend = new Map<string, { total: number; transactions: Transaction[] }>();
  for (const t of recentTransactions.filter((t) => t.amount < 0)) {
    const day = t.date.split('T')[0];
    const existing = dailySpend.get(day);
    if (existing) {
      existing.total += Math.abs(t.amount);
      existing.transactions.push(t);
    } else {
      dailySpend.set(day, { total: Math.abs(t.amount), transactions: [t] });
    }
  }

  for (const [day, data] of dailySpend) {
    if (data.total > avgDailySpend * 2.5) {
      const largestTransaction = data.transactions.sort(
        (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
      )[0];

      alerts.push({
        transactionId: largestTransaction.id,
        type: 'spending_spike',
        message: `Spending spike on ${day}: £${data.total.toFixed(2)} spent (${Math.round((data.total / avgDailySpend) * 100)}% of your daily average).`,
        severity: data.total > avgDailySpend * 5 ? 'high' : 'medium',
        isRead: false,
      });
    }
  }

  return alerts;
}

// Detect unknown merchants — merchants not seen in historical transactions
function detectUnknownMerchants(
  recentTransactions: Transaction[],
  historicalTransactions: Transaction[],
): AlertWithoutMeta[] {
  const alerts: AlertWithoutMeta[] = [];

  const knownMerchants = new Set(
    historicalTransactions.map((t) => t.merchant.toLowerCase())
  );

  const recentOutgoing = recentTransactions.filter((t) => t.amount < 0);

  for (const t of recentOutgoing) {
    if (
      !knownMerchants.has(t.merchant.toLowerCase()) &&
      t.merchant !== 'Unknown' &&
      Math.abs(t.amount) > 20
    ) {
      alerts.push({
        transactionId: t.id,
        type: 'unknown_merchant',
        message: `New merchant: £${Math.abs(t.amount).toFixed(2)} charged by "${t.merchant}" — first time seeing this merchant.`,
        severity: Math.abs(t.amount) > 100 ? 'medium' : 'low',
        isRead: false,
      });
    }
  }

  return alerts;
}

// Detect unusual amounts — transactions significantly larger than merchant average
function detectUnusualAmounts(
  recentTransactions: Transaction[],
  historicalTransactions: Transaction[],
): AlertWithoutMeta[] {
  const alerts: AlertWithoutMeta[] = [];

  // Build merchant average amounts from history
  const merchantAvg = new Map<string, { total: number; count: number }>();
  for (const t of historicalTransactions.filter((t) => t.amount < 0)) {
    const key = t.merchant.toLowerCase();
    const existing = merchantAvg.get(key);
    if (existing) {
      existing.total += Math.abs(t.amount);
      existing.count++;
    } else {
      merchantAvg.set(key, { total: Math.abs(t.amount), count: 1 });
    }
  }

  for (const t of recentTransactions.filter((t) => t.amount < 0)) {
    const key = t.merchant.toLowerCase();
    const avg = merchantAvg.get(key);
    if (!avg || avg.count < 3) continue;

    const merchantAvgAmount = avg.total / avg.count;
    const amount = Math.abs(t.amount);

    if (amount > merchantAvgAmount * 3) {
      alerts.push({
        transactionId: t.id,
        type: 'unusual_amount',
        message: `Unusual charge: £${amount.toFixed(2)} at "${t.merchant}" — normally around £${merchantAvgAmount.toFixed(2)}.`,
        severity: 'medium',
        isRead: false,
      });
    }
  }

  return alerts;
}
