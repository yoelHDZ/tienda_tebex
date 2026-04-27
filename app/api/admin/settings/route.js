import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json({ error: 'Settings file not found' }, { status: 404 });
    }
    const data = fs.readFileSync(settingsPath, 'utf8');
    const settings = JSON.parse(data);
    return NextResponse.json(settings);
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = JSON.stringify(body, null, 2);
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, data, 'utf8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to save settings' }, { status: 500 });
  }
}

