import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import Card from '../components/Card';
import AccountTile from '../components/AccountTile';
import SectionHeader from '../components/SectionHeader';
import { Account, AccountType } from '../types';

// ─── Demo data (same as HomeScreen) ──────────────────────────────────────────

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

const TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Banking',
  crypto: 'Crypto',
  investment: 'Investments',
};

const TYPE_ORDER: AccountType[] = ['bank', 'crypto', 'investment'];

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ConnectModalProps {
  onClose: () => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ onClose }) => {
  const [bankHovered, setBankHovered] = useState(false);
  const [cryptoHovered, setCryptoHovered] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: colors.overlay,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 100,
    },
    sheet: {
      width: '100%',
      maxWidth: 560,
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      borderBottom: 'none',
      padding: spacing.xl,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.md,
      paddingBottom: spacing.xxl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: borderRadius.full,
      backgroundColor: colors.textMuted,
      opacity: 0.4,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    sheetTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    sheetSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    optionBtn: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surfaceElevated,
      cursor: 'pointer',
      transition: 'border-color 0.15s ease, background-color 0.15s ease',
    },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.sm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
    },
    optionText: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1,
      textAlign: 'left' as const,
    },
    optionTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    optionDesc: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    cancelBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: colors.textMuted,
      fontSize: fontSize.sm,
      padding: `${spacing.sm}px 0`,
      textAlign: 'center' as const,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <span style={styles.sheetTitle}>Connect Account</span>
        <span style={styles.sheetSubtitle}>
          Choose what type of account to connect
        </span>

        <button
          style={{
            ...styles.optionBtn,
            borderColor: bankHovered ? colors.gold : colors.border,
            backgroundColor: bankHovered ? colors.accentDim : colors.surfaceElevated,
          }}
          onMouseEnter={() => setBankHovered(true)}
          onMouseLeave={() => setBankHovered(false)}
          onClick={onClose}
        >
          <div
            style={{
              ...styles.optionIcon,
              backgroundColor: 'rgba(96,165,250,0.15)',
            }}
          >
            🏦
          </div>
          <div style={styles.optionText}>
            <span style={styles.optionTitle}>Connect Bank</span>
            <span style={styles.optionDesc}>
              Link via Open Banking — read-only access
            </span>
          </div>
          <span style={{ color: colors.textMuted, fontSize: 18 }}>›</span>
        </button>

        <button
          style={{
            ...styles.optionBtn,
            borderColor: cryptoHovered ? colors.gold : colors.border,
            backgroundColor: cryptoHovered ? colors.accentDim : colors.surfaceElevated,
          }}
          onMouseEnter={() => setCryptoHovered(true)}
          onMouseLeave={() => setCryptoHovered(false)}
          onClick={onClose}
        >
          <div
            style={{
              ...styles.optionIcon,
              backgroundColor: 'rgba(232,184,109,0.12)',
            }}
          >
            ₿
          </div>
          <div style={styles.optionText}>
            <span style={styles.optionTitle}>Connect Crypto</span>
            <span style={styles.optionDesc}>
              Add a wallet address or exchange API key
            </span>
          </div>
          <span style={{ color: colors.textMuted, fontSize: 18 }}>›</span>
        </button>

        <button style={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const AccountsScreen: React.FC = () => {
  const [accounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [showModal, setShowModal] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    screen: {
      width: '100%',
      height: '100vh',
      backgroundColor: colors.background,
      overflowY: 'auto',
      position: 'relative',
      boxSizing: 'border-box',
    },
    inner: {
      maxWidth: 600,
      margin: '0 auto',
      padding: `${spacing.xl}px ${spacing.md}px ${100}px`,
      display: 'flex',
      flexDirection: 'column',
    },
    pageHeader: {
      marginBottom: spacing.lg,
    },
    pageTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
    },
    pageSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    fab: {
      position: 'fixed',
      bottom: spacing.xxl,
      right: '50%',
      transform: 'translateX(260px)',
      width: 56,
      height: 56,
      borderRadius: borderRadius.full,
      backgroundColor: fabHovered ? '#d4a355' : colors.gold,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      color: colors.background,
      fontWeight: fontWeight.bold,
      boxShadow: `0 4px 24px rgba(232,184,109,0.35)`,
      transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
      zIndex: 50,
      lineHeight: 1,
    },
  };

  // Group accounts by type
  const grouped = TYPE_ORDER.reduce<Record<string, Account[]>>((acc, type) => {
    const filtered = accounts.filter((a) => a.type === type);
    if (filtered.length > 0) acc[type] = filtered;
    return acc;
  }, {});

  return (
    <div style={styles.screen}>
      <div style={styles.inner}>
        {/* Page header */}
        <div style={styles.pageHeader}>
          <h1 style={{ ...styles.pageTitle, margin: 0 }}>Accounts</h1>
          <p style={{ ...styles.pageSubtitle, margin: `${spacing.xs}px 0 0` }}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
          </p>
        </div>

        {/* Grouped account list */}
        {TYPE_ORDER.map((type) => {
          const group = grouped[type];
          if (!group) return null;
          return (
            <div key={type}>
              <SectionHeader title={TYPE_LABELS[type]} />
              <Card style={{ marginBottom: spacing.md }}>
                {group.map((acc, i) => (
                  <div
                    key={acc.id}
                    style={
                      i < group.length - 1
                        ? { borderBottom: `1px solid ${colors.border}` }
                        : {}
                    }
                  >
                    <AccountTile account={acc} onClick={() => {}} />
                  </div>
                ))}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Floating action button */}
      <button
        style={styles.fab}
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        aria-label="Add account"
      >
        +
      </button>

      {/* Connect modal */}
      {showModal && <ConnectModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default AccountsScreen;
