const translationEnabled = process.env.TRANSLATION_SYSTEM_ENABLED !== 'false';

export const settings = {
  translation_system: {
    enabled: translationEnabled
  }
};

export function getSettings() {
  return settings;
}

export function getPublicSettings() {
  return settings;
}

