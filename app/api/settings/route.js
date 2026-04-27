import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPublicSettings } from '../../../utils/settings';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json({ error: 'Settings file not found' }, { status: 404 });
    }
    const data = fs.readFileSync(settingsPath, 'utf8');
    const json = JSON.parse(data);
    const settings = getPublicSettings();

    const serverRules = json.rules?.settings?.rules || [];
    const discordRules = json.rules?.settings?.discord_rules || [];

    return NextResponse.json({ settings, serverRules, discordRules });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to load settings' }, { status: 500 });
  }
}

