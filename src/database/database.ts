// Vault — Local encrypted database
// All data stays on device. Zero server communication.

import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../constants/config';
import { CREATE_TABLES_SQL } from './schema';
import type {
  Account,
  Transaction,
  Subscription,
  NetWorthSnapshot,
  HealthScore,
  AnomalyAlert,
} from '../types';

let db: SQLite.SQLiteDatabase | null = null;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(APP_CONFIG.database.name);
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');
  for (const sql of CREATE_TABLES_SQL) {
    await db.execAsync(sql);
  }
  return db;
}

// --- Secure token storage (AES-256 via expo-secure-store) ---

export async function storeEncryptedToken(key: string, token: string): Promise<void> {
  await SecureStore.setItemAsync(key, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function getEncryptedToken(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteEncryptedToken(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

// --- Accounts ---

export async function insertAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const database = await getDatabase();
  const id = generateId();
  await database.runAsync(
    `INSERT INTO accounts (id, name, type, provider, balance, currency, last_synced, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, account.name, account.type, account.provider, account.balance, account.currency, account.lastSynced, account.icon ?? null]
  );
  return { id, ...account };
}

export async function getAllAccounts(): Promise<Account[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string; name: string; type: string; provider: string;
    balance: number; currency: string; last_synced: string; icon: string | null;
  }>('SELECT * FROM accounts ORDER BY type, name');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as Account['type'],
    provider: row.provider,
    balance: row.balance,
    currency: row.currency,
    lastSynced: row.last_synced,
    icon: row.icon ?? undefined,
  }));
}

export async function updateAccountBalance(id: string, balance: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE accounts SET balance = ?, last_synced = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
    [balance, id]
  );
}

export async function deleteAccount(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
  await deleteEncryptedToken(`truelayer_token_${id}`);
}

// --- Transactions ---

export async function insertTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<void> {
  const database = await getDatabase();
  for (const t of transactions) {
    const id = generateId();
    await database.runAsync(
      `INSERT OR IGNORE INTO transactions (id, account_id, amount, currency, description, merchant, category, date, is_recurring, is_anomaly)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, t.accountId, t.amount, t.currency, t.description, t.merchant, t.category, t.date, t.isRecurring ? 1 : 0, t.isAnomaly ? 1 : 0]
    );
  }
}

export async function getTransactionsByAccount(accountId: string, limit = 50): Promise<Transaction[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string; account_id: string; amount: number; currency: string;
    description: string; merchant: string; category: string; date: string;
    is_recurring: number; is_anomaly: number;
  }>(
    'SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC LIMIT ?',
    [accountId, limit]
  );
  return rows.map((row) => ({
    id: row.id,
    accountId: row.account_id,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    merchant: row.merchant,
    category: row.category,
    date: row.date,
    isRecurring: row.is_recurring === 1,
    isAnomaly: row.is_anomaly === 1,
  }));
}

export async function getRecentTransactions(limit = 20): Promise<Transaction[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string; account_id: string; amount: number; currency: string;
    description: string; merchant: string; category: string; date: string;
    is_recurring: number; is_anomaly: number;
  }>(
    'SELECT * FROM transactions ORDER BY date DESC LIMIT ?',
    [limit]
  );
  return rows.map((row) => ({
    id: row.id,
    accountId: row.account_id,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    merchant: row.merchant,
    category: row.category,
    date: row.date,
    isRecurring: row.is_recurring === 1,
    isAnomaly: row.is_anomaly === 1,
  }));
}

// --- Subscriptions ---

export async function upsertSubscription(sub: Omit<Subscription, 'id'>): Promise<void> {
  const database = await getDatabase();
  const id = generateId();
  await database.runAsync(
    `INSERT INTO subscriptions (id, name, amount, currency, frequency, last_charge_date, next_charge_date, is_active, days_since_last_use, cancel_url, account_id, merchant)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       amount = excluded.amount,
       last_charge_date = excluded.last_charge_date,
       next_charge_date = excluded.next_charge_date,
       is_active = excluded.is_active,
       days_since_last_use = excluded.days_since_last_use`,
    [id, sub.name, sub.amount, sub.currency, sub.frequency, sub.lastChargeDate, sub.nextChargeDate, sub.isActive ? 1 : 0, sub.daysSinceLastUse, sub.cancelUrl ?? null, sub.accountId, sub.merchant]
  );
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string; name: string; amount: number; currency: string;
    frequency: string; last_charge_date: string; next_charge_date: string;
    is_active: number; days_since_last_use: number; cancel_url: string | null;
    account_id: string; merchant: string;
  }>('SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY amount DESC');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    frequency: row.frequency as Subscription['frequency'],
    lastChargeDate: row.last_charge_date,
    nextChargeDate: row.next_charge_date,
    isActive: row.is_active === 1,
    daysSinceLastUse: row.days_since_last_use,
    cancelUrl: row.cancel_url ?? undefined,
    accountId: row.account_id,
    merchant: row.merchant,
  }));
}

// --- Net Worth Snapshots ---

export async function insertNetWorthSnapshot(snapshot: Omit<NetWorthSnapshot, 'date'> & { date?: string }): Promise<void> {
  const database = await getDatabase();
  const date = snapshot.date ?? new Date().toISOString().split('T')[0];
  await database.runAsync(
    `INSERT OR REPLACE INTO net_worth_snapshots (date, total, banking, crypto, investments)
     VALUES (?, ?, ?, ?, ?)`,
    [date, snapshot.total, snapshot.breakdown.banking, snapshot.breakdown.crypto, snapshot.breakdown.investments]
  );
}

export async function getNetWorthHistory(days = 30): Promise<NetWorthSnapshot[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    date: string; total: number; banking: number; crypto: number; investments: number;
  }>(
    `SELECT * FROM net_worth_snapshots ORDER BY date DESC LIMIT ?`,
    [days]
  );
  return rows.map((row) => ({
    date: row.date,
    total: row.total,
    breakdown: { banking: row.banking, crypto: row.crypto, investments: row.investments },
  })).reverse();
}

// --- Health Scores ---

export async function insertHealthScore(score: HealthScore): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO health_scores (overall, savings_rate, debt_ratio, spending_trend, net_worth_trend, calculated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [score.overall, score.savingsRate, score.debtRatio, score.spendingTrend, score.netWorthTrend, score.calculatedAt]
  );
}

export async function getLatestHealthScore(): Promise<HealthScore | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    overall: number; savings_rate: number; debt_ratio: number;
    spending_trend: number; net_worth_trend: number; calculated_at: string;
  }>('SELECT * FROM health_scores ORDER BY calculated_at DESC LIMIT 1');

  if (!row) return null;
  return {
    overall: row.overall,
    savingsRate: row.savings_rate,
    debtRatio: row.debt_ratio,
    spendingTrend: row.spending_trend,
    netWorthTrend: row.net_worth_trend,
    calculatedAt: row.calculated_at,
  };
}

// --- Anomaly Alerts ---

export async function insertAlert(alert: Omit<AnomalyAlert, 'id' | 'createdAt'>): Promise<void> {
  const database = await getDatabase();
  const id = generateId();
  await database.runAsync(
    `INSERT INTO anomaly_alerts (id, transaction_id, type, message, severity, is_read)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, alert.transactionId, alert.type, alert.message, alert.severity]
  );
}

export async function getUnreadAlerts(): Promise<AnomalyAlert[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string; transaction_id: string; type: string; message: string;
    severity: string; is_read: number; created_at: string;
  }>('SELECT * FROM anomaly_alerts WHERE is_read = 0 ORDER BY created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    transactionId: row.transaction_id,
    type: row.type as AnomalyAlert['type'],
    message: row.message,
    severity: row.severity as AnomalyAlert['severity'],
    isRead: false,
    createdAt: row.created_at,
  }));
}

export async function markAlertRead(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE anomaly_alerts SET is_read = 1 WHERE id = ?', [id]);
}

// --- User Preferences ---

export async function setPreference(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getPreference(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_preferences WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}
