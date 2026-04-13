// Vault — SQLite schema
// All data stored locally with AES-256 encryption. Never synced to cloud.

export const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bank', 'crypto', 'investment')),
    provider TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'GBP',
    last_synced TEXT NOT NULL,
    icon TEXT,
    access_token_encrypted TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GBP',
    description TEXT NOT NULL,
    merchant TEXT,
    category TEXT,
    date TEXT NOT NULL,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    is_anomaly INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GBP',
    frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'yearly')),
    last_charge_date TEXT NOT NULL,
    next_charge_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    days_since_last_use INTEGER NOT NULL DEFAULT 0,
    cancel_url TEXT,
    account_id TEXT NOT NULL,
    merchant TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    total REAL NOT NULL,
    banking REAL NOT NULL DEFAULT 0,
    crypto REAL NOT NULL DEFAULT 0,
    investments REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS health_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    overall INTEGER NOT NULL,
    savings_rate REAL NOT NULL,
    debt_ratio REAL NOT NULL,
    spending_trend REAL NOT NULL,
    net_worth_trend REAL NOT NULL,
    calculated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS anomaly_alerts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high')),
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  // Indices for performance
  `CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring)`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_net_worth_date ON net_worth_snapshots(date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_unread ON anomaly_alerts(is_read)`,
];
