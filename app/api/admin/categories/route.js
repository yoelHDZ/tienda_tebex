import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const adminPass = cookieStore.get('admin-pass')?.value;
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Tebex token not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://headless.tebex.io/api/accounts/${token}/categories?includePackages=1`, {
      method: 'GET',
      headers: {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch categories from Tebex' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.data || []);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
