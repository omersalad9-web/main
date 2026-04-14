// Vault — Privacy-First Financial Dashboard (Web)
// All data processed and stored in browser localStorage only.

import React, { useState, useEffect, useCallback } from 'react';
import { getPreference, setPreference } from './database/database';

// Screens
import LockScreen from './screens/LockScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import AccountsScreen from './screens/AccountsScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import InsightsScreen from './screens/InsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabBar from './components/TabBar';

type AppState = 'lock' | 'onboarding' | 'app';
type Tab = 'home' | 'accounts' | 'subscriptions' | 'insights' | 'settings';

export default function App() {
  const [appState, setAppState] = useState<AppState>('lock');
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    // Check if onboarding has been completed
    getPreference('has_completed_onboarding').then((val) => {
      if (val === 'true') {
        // Still show lock screen first
      }
    });
  }, []);

  const handleUnlock = useCallback(async () => {
    const completed = await getPreference('has_completed_onboarding');
    if (completed === 'true') {
      setAppState('app');
    } else {
      setAppState('onboarding');
    }
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await setPreference('has_completed_onboarding', 'true');
    setAppState('app');
  }, []);

  // Lock screen
  if (appState === 'lock') {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  // Onboarding
  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Main app
  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'accounts': return <AccountsScreen />;
      case 'subscriptions': return <SubscriptionsScreen />;
      case 'insights': return <InsightsScreen />;
      case 'settings': return <SettingsScreen />;
    }
  };

  return (
    <div style={appStyles.container}>
      <div style={appStyles.content}>
        {renderScreen()}
      </div>
      <TabBar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
    </div>
  );
}

const appStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    backgroundColor: '#0D0D1A',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    paddingBottom: 80,
  },
};
