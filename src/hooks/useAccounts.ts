// Vault — Account data hook (web version)

import { useState, useEffect, useCallback } from 'react';
import {
  getAllAccounts,
  insertAccount,
  updateAccountBalance,
  deleteAccount as dbDeleteAccount,
  getNetWorthHistory,
  insertNetWorthSnapshot,
} from '../database/database';
import type { Account, NetWorthSnapshot } from '../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAllAccounts();
      setAccounts(data);
      const history = await getNetWorthHistory(90);
      setNetWorthHistory(history);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    const created = await insertAccount(account);
    setAccounts((prev) => [...prev, created]);
    return created;
  }, []);

  const refreshBalance = useCallback(async (id: string, balance: number) => {
    await updateAccountBalance(id, balance);
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, balance, lastSynced: new Date().toISOString() } : a))
    );
  }, []);

  const removeAccount = useCallback(async (id: string) => {
    await dbDeleteAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  const netWorthByType = {
    banking: accounts.filter((a) => a.type === 'bank').reduce((s, a) => s + a.balance, 0),
    crypto: accounts.filter((a) => a.type === 'crypto').reduce((s, a) => s + a.balance, 0),
    investments: accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + a.balance, 0),
  };

  return {
    accounts,
    isLoading,
    totalNetWorth,
    netWorthByType,
    netWorthHistory,
    addAccount,
    refreshBalance,
    removeAccount,
    reload: loadAccounts,
  };
}
