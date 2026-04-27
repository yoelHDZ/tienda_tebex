import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
const privateSettingKeys = new Set(['ghost_api_key']);

function loadSettings() {
  if (!fs.existsSync(settingsPath)) {
    throw new Error('Settings file not found at data/settings.json');
  }
  
  const data = fs.readFileSync(settingsPath, 'utf8');
  const json = JSON.parse(data);
  
  const flattened = {};
  Object.entries(json).forEach(([key, value]) => {
    if (value && typeof value === 'object' && value.settings) {
      Object.entries(value.settings).forEach(([skey, svalue]) => {
        flattened[skey] = svalue;
      });
    } else {
      flattened[key] = value;
    }
  });
  
  return {
    ...flattened,
    translation_system: json.translation?.settings || {},
    blog_system: json.blog?.settings || {},
    extra_pages: json.extra_pages?.settings || { pages: [] },
    sales: json.sales?.settings || {},
    theme: json.theme?.settings || {},
    community_goal_variant: json.community_goal?.settings?.variant || 'bar',
    voting_links: json.vote?.settings?.links || [],
    gamemodes_config: json.gamemodes?.settings || { gamemodes_enabled: false, default_gamemode: '', gamemodes_list: [] },
  };
}

export function getSettings() {
  return loadSettings();
}

function sanitizePublicSettings(value, parentKey = '') {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePublicSettings(item, parentKey));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !privateSettingKeys.has(key))
        .map(([key, childValue]) => [key, sanitizePublicSettings(childValue, key)])
    );
  }

  if (privateSettingKeys.has(parentKey)) {
    return undefined;
  }

  return value;
}

export function getPublicSettings() {
  return sanitizePublicSettings(loadSettings());
}

function loadRules() {
  if (!fs.existsSync(settingsPath)) {
    return { serverRules: [], discordRules: [] };
  }
  
  const data = fs.readFileSync(settingsPath, 'utf8');
  const json = JSON.parse(data);
  
  return {
    serverRules: json.rules?.settings?.rules || [],
    discordRules: json.rules?.settings?.discord_rules || [],
  };
}

export const settings = loadSettings();

const rules = loadRules();
export const serverRules = rules.serverRules;
export const discordRules = rules.discordRules;
