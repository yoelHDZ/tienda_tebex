import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD || '';
    
    if (!expected) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
    }
    
    if (password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    const cookieStore = cookies();
    cookieStore.set('admin-pass', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to login' }, { status: 500 });
  }
}

