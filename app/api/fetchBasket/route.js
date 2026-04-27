import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent } = await req.json();

    const response = await fetch(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/baskets/${basketIdent}`, {
        method: 'GET'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.detail || 'Failed to fetch basket' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ basket: data });
}


