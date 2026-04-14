import React, { useState } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import Card from '../components/Card';
import { Account } from '../types';
import { APP_CONFIG } from '../constants/config';

// ─── Demo accounts ────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SettingsRowProps {
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  sublabel,
  right,
  danger,
  onClick,
  disabled,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.md}px 0`,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.45 : hovered && onClick ? 0.75 : 1,
        transition: 'opacity 0.15s ease',
      }}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium,
            color: danger ? colors.negative : colors.textPrimary,
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: fontSize.xs,
              color: colors.textMuted,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
};

// Toggle switch component
interface ToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange }) => {
  const trackColor = value ? colors.gold : colors.surfaceHighlight;
  const thumbX = value ? 22 : 2;

  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: trackColor,
        border: `1px solid ${value ? colors.gold : colors.border}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: thumbX,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: value ? colors.background : colors.textMuted,
          transition: 'left 0.2s ease, background-color 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );
};

// Section wrapper with a divider between rows
interface SettingsSectionProps {
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ children }) => {
  const childArray = React.Children.toArray(children);
  return (
    <Card style={{ marginBottom: spacing.md, padding: `0 ${spacing.md}px` }}>
      {childArray.map((child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < childArray.length - 1 && (
            <div
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginLeft: 0,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS);

  const handleDisconnect = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    const confirmed = window.confirm(
      `Disconnect "${account.name}"? This will remove all associated data.`,
    );
    if (confirmed) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleDeleteAllData = () => {
    const confirmed = window.confirm(
      'Delete ALL Vault data? This cannot be undone. All accounts, transactions, and settings will be permanently erased.',
    );
    if (confirmed) {
      // In production, this would call database.clearAll()
      window.alert('All data has been deleted.');
    }
  };

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
    },
    pageTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      margin: 0,
      marginBottom: spacing.lg,
    },
    sectionLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    // Account row
    accountRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.md}px 0`,
    },
    accountLeft: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    accountIconBox: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surfaceElevated,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
    },
    accountName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.textPrimary,
    },
    accountProvider: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    disconnectBtn: {
      background: 'none',
      border: `1px solid ${colors.negative}`,
      borderRadius: borderRadius.sm,
      color: colors.negative,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      padding: `${spacing.xs}px ${spacing.sm}px`,
      cursor: 'pointer',
    },
    // Premium card
    premiumCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: colors.accentDim,
      border: `1px solid rgba(232,184,109,0.3)`,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    premiumLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    premiumTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.gold,
    },
    premiumPrice: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    premiumBadge: {
      backgroundColor: colors.gold,
      color: colors.background,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      padding: `${spacing.xs}px ${spacing.sm}px`,
      borderRadius: borderRadius.full,
      letterSpacing: '0.5px',
    },
    // Footer
    footer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    footerDiamond: {
      fontSize: 24,
      color: colors.gold,
      opacity: 0.7,
    },
    footerText: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      textAlign: 'center',
    },
  };

  const accountIcons: Record<string, string> = {
    bank: '🏦',
    crypto: '₿',
    investment: '📈',
  };

  return (
    <div style={styles.screen}>
      <div style={styles.inner}>
        <h1 style={styles.pageTitle}>Settings</h1>

        {/* Security */}
        <span style={styles.sectionLabel}>Security</span>
        <SettingsSection>
          <SettingsRow
            label="Face ID Lock"
            sublabel="Require biometric auth on open"
            right={
              <Toggle value={faceIdEnabled} onChange={setFaceIdEnabled} />
            }
          />
          <SettingsRow
            label="Notifications"
            sublabel="Anomaly and spending alerts"
            right={
              <Toggle
                value={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
            }
          />
          <SettingsRow
            label="Auto-Lock"
            sublabel="After 1 minute of inactivity"
            right={
              <span
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                1 min <span style={{ fontSize: 14, opacity: 0.5 }}>›</span>
              </span>
            }
          />
        </SettingsSection>

        {/* Connected Accounts */}
        <span style={styles.sectionLabel}>Connected Accounts</span>
        <Card style={{ marginBottom: spacing.md, padding: `0 ${spacing.md}px` }}>
          {accounts.map((acc, i) => (
            <React.Fragment key={acc.id}>
              <div style={styles.accountRow}>
                <div style={styles.accountLeft}>
                  <div style={styles.accountIconBox}>
                    <span>{accountIcons[acc.type] ?? '💳'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={styles.accountName}>{acc.name}</span>
                    <span style={styles.accountProvider}>{acc.provider}</span>
                  </div>
                </div>
                <button
                  style={styles.disconnectBtn}
                  onClick={() => handleDisconnect(acc.id)}
                >
                  Disconnect
                </button>
              </div>
              {i < accounts.length - 1 && (
                <div style={{ height: 1, backgroundColor: colors.border }} />
              )}
            </React.Fragment>
          ))}
          {accounts.length === 0 && (
            <div
              style={{
                padding: spacing.lg,
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: fontSize.sm,
              }}
            >
              No accounts connected
            </div>
          )}
        </Card>

        {/* Data */}
        <span style={styles.sectionLabel}>Data</span>
        <SettingsSection>
          <SettingsRow
            label="Export PDF Report"
            sublabel="Coming soon"
            disabled
            right={
              <span
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textMuted,
                  backgroundColor: colors.surfaceElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.full,
                  padding: `2px ${spacing.sm}px`,
                }}
              >
                Soon
              </span>
            }
          />
          <SettingsRow
            label="Delete All Data"
            danger
            sublabel="Permanently erase everything from this device"
            onClick={handleDeleteAllData}
            right={
              <span style={{ color: colors.negative, fontSize: 18, opacity: 0.6 }}>
                ›
              </span>
            }
          />
        </SettingsSection>

        {/* Subscription */}
        <span style={styles.sectionLabel}>Subscription</span>
        <div style={styles.premiumCard}>
          <div style={styles.premiumLeft}>
            <span style={styles.premiumTitle}>Vault Premium</span>
            <span style={styles.premiumPrice}>{APP_CONFIG.subscriptionPrice}</span>
          </div>
          <span style={styles.premiumBadge}>ACTIVE</span>
        </div>

        {/* About */}
        <span style={styles.sectionLabel}>About</span>
        <SettingsSection>
          <SettingsRow
            label="Version"
            right={
              <span
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                }}
              >
                {APP_CONFIG.version}
              </span>
            }
          />
          <SettingsRow
            label="Privacy Policy"
            right={
              <span style={{ color: colors.textMuted, fontSize: 18, opacity: 0.5 }}>
                ›
              </span>
            }
            onClick={() => {}}
          />
          <SettingsRow
            label="Terms of Service"
            right={
              <span style={{ color: colors.textMuted, fontSize: 18, opacity: 0.5 }}>
                ›
              </span>
            }
            onClick={() => {}}
          />
        </SettingsSection>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerDiamond}>◇</span>
          <span style={styles.footerText}>
            No data is collected. Vault runs entirely on your device.
          </span>
          <span
            style={{
              fontSize: fontSize.xs,
              color: colors.textMuted,
              opacity: 0.5,
              textAlign: 'center',
            }}
          >
            {APP_CONFIG.name} v{APP_CONFIG.version} — Built for privacy
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
