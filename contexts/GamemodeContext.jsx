'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from './SettingsContext';

const GamemodeContext = createContext(null);

export function GamemodeProvider({ children }) {
  const settings = useSettings();
  const config = settings?.gamemodes_config;
  const enabled = config?.gamemodes_enabled === true;
  const gamemodes = useMemo(() => Array.isArray(config?.gamemodes_list) ? config.gamemodes_list : [], [config?.gamemodes_list]);
  const defaultId = config?.default_gamemode || '';

  const [activeGamemode, setActiveGamemode] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    if (!enabled || gamemodes.length === 0) {
      setHydrated(true);
      return;
    }

    let stored = null;
    try {
      stored = localStorage.getItem('active_gamemode');
    } catch {}

    if (stored && gamemodes.find(g => g.id === stored)) {
      setActiveGamemode(stored);
    } else if (defaultId && gamemodes.find(g => g.id === defaultId)) {
      setActiveGamemode(defaultId);
    } else {
      setActiveGamemode(gamemodes[0].id);
    }
    setHydrated(true);
  }, [enabled, gamemodes, defaultId]);

  const switchGamemode = (id) => {
    setActiveGamemode(id);
    try {
      localStorage.setItem('active_gamemode', id);
    } catch {}
  };

  const activeGm = gamemodes.find(g => g.id === activeGamemode) || null;

  return (
    <GamemodeContext.Provider value={{ enabled, gamemodes, activeGamemode, activeGm, switchGamemode, hydrated }}>
      {children}
    </GamemodeContext.Provider>
  );
}

export function useGamemode() {
  const context = useContext(GamemodeContext);
  if (!context) {
    throw new Error('useGamemode must be used within GamemodeProvider');
  }
  return context;
}
