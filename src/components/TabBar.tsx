import React, { useState } from 'react';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { key: 'Home', label: 'Home', icon: '⌂' },
  { key: 'Accounts', label: 'Accounts', icon: '◈' },
  { key: 'Subscriptions', label: 'Subscriptions', icon: '↻' },
  { key: 'Insights', label: 'Insights', icon: '◉' },
  { key: 'Settings', label: 'Settings', icon: '⚙' },
];

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const styles: Record<string, React.CSSProperties> = {
    bar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      backgroundColor: colors.surface,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      zIndex: 100,
      boxSizing: 'border-box',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    },
    tabButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flex: 1,
      gap: 3,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: `${spacing.xs}px 0`,
    },
  };

  return (
    <nav style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isHovered = hoveredTab === tab.key;
        const color = isActive
          ? colors.gold
          : isHovered
          ? colors.textSecondary
          : colors.textMuted;

        return (
          <button
            key={tab.key}
            style={styles.tabButton}
            onClick={() => onTabChange(tab.key)}
            onMouseEnter={() => setHoveredTab(tab.key)}
            onMouseLeave={() => setHoveredTab(null)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              style={{
                fontSize: 20,
                color,
                transition: 'color 0.15s ease',
                lineHeight: 1,
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: fontSize.xs,
                fontWeight: isActive ? fontWeight.semibold : fontWeight.regular,
                color,
                transition: 'color 0.15s ease, font-weight 0.15s ease',
                letterSpacing: '0.2px',
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <span
                style={{
                  position: 'absolute' as const,
                  top: 0,
                  width: 24,
                  height: 2,
                  borderRadius: 2,
                  backgroundColor: colors.gold,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
