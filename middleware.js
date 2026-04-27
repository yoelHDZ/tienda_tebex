import { settings } from './utils/settings-edge';
import { NextResponse } from 'next/server';

export default function middleware(request) {
  if (!settings.translation_system?.enabled) {
    return;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};