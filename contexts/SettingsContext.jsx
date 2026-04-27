'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext({ settings: {}, loading: true });

export function SettingsProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setLoading(false);
      return;
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, [initialSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  return context?.settings || {};
}

