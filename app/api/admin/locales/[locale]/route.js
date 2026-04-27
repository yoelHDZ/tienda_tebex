import { NextResponse } from 'next/server';
import { canWriteLocales, hasLocale, readLocaleMessages, writeLocaleMessages } from '../../../../../utils/messages-store';

export async function GET(request, { params }) {
  try {
    const { locale } = await params;
    if (!hasLocale(locale)) {
      return NextResponse.json({ error: 'Locale not found' }, { status: 404 });
    }
    const { messages } = readLocaleMessages(locale);
    return NextResponse.json(messages);
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to load locale' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { locale } = await params;
    const body = await request.json();
    if (!canWriteLocales()) {
      return NextResponse.json(
        { error: 'Locale saving is not available in this deployment environment' },
        { status: 501 }
      );
    }
    writeLocaleMessages(locale, body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to save locale' }, { status: 500 });
  }
}

