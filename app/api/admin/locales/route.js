import { NextResponse } from 'next/server';
import { listLocales } from '../../../../utils/messages-store';

export async function GET() {
  try {
    const locales = listLocales();
    return NextResponse.json({ locales });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to load locales' }, { status: 500 });
  }
}

