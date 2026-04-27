'use client'

import { useEffect, useState } from 'react';

let cachedSettings = null;
let loadingPromise = null;

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    if (loadingPromise) {
      loadingPromise.then((data) => {
        cachedSettings = data;
        setSettings(data);
        setLoading(false);
      });
      return;
    }

    loadingPromise = fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const resolvedSettings = data?.settings || null;
        cachedSettings = resolvedSettings;
        return resolvedSettings;
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        return null;
      });

    loadingPromise.then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}

