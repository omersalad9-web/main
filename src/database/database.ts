// Vault — Web database layer
// Uses localStorage for persistence. All data stays in the browser.

import type {
  Account,
  Transaction,
  Subscription,
  NetWorthSnapshot,
  HealthScore,
  AnomalyAlert,
} from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`vault_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(`vault_${key}`, JSON.stringify(data));
}

// --- Accounts ---

export async function insertAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const accounts = getStore<Account>('accounts');
  const created: Account = { id: generateId(), ...account };
  accounts.push(created);
  setStore('accounts', accounts);
  return created;
}

export async function getAllAccounts(): Promise<Account[]> {
  return getStore<Account>('accounts');
}

export async function updateAccountBalance(id: string, balance: number): Promise<void> {
  const accounts = getStore<Account>('accounts');
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    accounts[idx].balance = balance;
    accounts[idx].lastSynced = new Date().toISOString();
    setStore('accounts', accounts);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const accounts = getStore<Account>('accounts').filter((a) => a.id !== id);
  setStore('accounts', accounts);
  // Also remove related transactions and subscriptions
  const txns = getStore<Transaction>('transactions').filter((t) => t.accountId !== id);
  setStore('transactions', txns);
  const subs = getStore<Subscription>('subscriptions').filter((s) => s.accountId !== id);
  setStore('subscriptions', subs);
}

// --- Transactions ---

export async function insertTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<void> {
  const existing = getStore<Transaction>('transactions');
  for (const t of transactions) {
    existing.push({ id: generateId(), ...t });
  }
  setStore('transactions', existing);
}

export async function getRecentTransactions(limit = 20): Promise<Transaction[]> {
  return getStore<Transaction>('transactions')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// --- Subscriptions ---

export async function getAllSubscriptions(): Promise<Subscription[]> {
  return getStore<Subscription>('subscriptions').filter((s) => s.isActive);
}

// --- Net Worth Snapshots ---

export async function insertNetWorthSnapshot(snapshot: Omit<NetWorthSnapshot, 'date'> & { date?: string }): Promise<void> {
  const snapshots = getStore<NetWorthSnapshot>('networth');
  const date = snapshot.date ?? new Date().toISOString().split('T')[0];
  const idx = snapshots.findIndex((s) => s.date === date);
  const entry: NetWorthSnapshot = { date, total: snapshot.total, breakdown: snapshot.breakdown };
  if (idx !== -1) {
    snapshots[idx] = entry;
  } else {
    snapshots.push(entry);
  }
  setStore('networth', snapshots);
}

export async function getNetWorthHistory(days = 30): Promise<NetWorthSnapshot[]> {
  return getStore<NetWorthSnapshot>('networth')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);
}

// --- Health Scores ---

export async function insertHealthScore(score: HealthScore): Promise<void> {
  const scores = getStore<HealthScore>('healthscores');
  scores.push(score);
  setStore('healthscores', scores);
}

export async function getLatestHealthScore(): Promise<HealthScore | null> {
  const scores = getStore<HealthScore>('healthscores');
  return scores.length > 0 ? scores[scores.length - 1] : null;
}

// --- Anomaly Alerts ---

export async function insertAlert(alert: Omit<AnomalyAlert, 'id' | 'createdAt'>): Promise<void> {
  const alerts = getStore<AnomalyAlert>('alerts');
  alerts.push({ id: generateId(), ...alert, createdAt: new Date().toISOString() });
  setStore('alerts', alerts);
}

export async function getUnreadAlerts(): Promise<AnomalyAlert[]> {
  return getStore<AnomalyAlert>('alerts').filter((a) => !a.isRead);
}

export async function markAlertRead(id: string): Promise<void> {
  const alerts = getStore<AnomalyAlert>('alerts');
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    alerts[idx].isRead = true;
    setStore('alerts', alerts);
  }
}

// --- User Preferences ---

export async function setPreference(key: string, value: string): Promise<void> {
  localStorage.setItem(`vault_pref_${key}`, value);
}

export async function getPreference(key: string): Promise<string | null> {
  return localStorage.getItem(`vault_pref_${key}`);
}

// --- Secure token storage (uses localStorage for web demo) ---

export async function storeEncryptedToken(key: string, token: string): Promise<void> {
  localStorage.setItem(`vault_token_${key}`, token);
}

export async function getEncryptedToken(key: string): Promise<string | null> {
  return localStorage.getItem(`vault_token_${key}`);
}

export async function deleteEncryptedToken(key: string): Promise<void> {
  localStorage.removeItem(`vault_token_${key}`);
}
