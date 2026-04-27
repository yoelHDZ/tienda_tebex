import { NextResponse } from "next/server";

const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;

const normalizeUsername = (value) => String(value || '').trim().toLowerCase();

const getBasketUsername = (basketData) => {
    return (
        basketData?.username ||
        basketData?.player?.username ||
        basketData?.user?.username ||
        basketData?.creator?.name ||
        ''
    );
};

const createBasket = async ({ username, origin }) => {
    const response = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            cancel_url: origin,
            complete_url: `${origin}/completed`
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Failed to create basket');
    }

    return response.json();
};

export async function POST(req) {
    try {
        if (!token) {
            return NextResponse.json({ message: 'Missing Tebex token' }, { status: 500 });
        }

        const { basketIdent, username, origin } = await req.json();
        console.log('Basket validation request', { basketIdent, username });
        const trimmedUsername = String(username || '').trim();
        const safeOrigin = String(origin || '').trim();

        if (!trimmedUsername) {
            return NextResponse.json({ requiresLogout: true });
        }

        if (!safeOrigin) {
            return NextResponse.json({ message: 'Missing origin' }, { status: 400 });
        }

        if (!basketIdent) {
            const newBasket = await createBasket({ username: trimmedUsername, origin: safeOrigin });
            return NextResponse.json({ basket: newBasket, refreshed: true });
        }

        const basketResponse = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}`, {
            method: 'GET'
        });

        if (!basketResponse.ok) {
            const newBasket = await createBasket({ username: trimmedUsername, origin: safeOrigin });
            return NextResponse.json({ basket: newBasket, refreshed: true });
        }

        const basket = await basketResponse.json().catch(() => null);
        const basketData = basket?.data || {};
        console.log('Basket validation response', basketData);

        if (!basketData.ident) {
            const newBasket = await createBasket({ username: trimmedUsername, origin: safeOrigin });
            return NextResponse.json({ basket: newBasket, refreshed: true });
        }

        const basketUsername = getBasketUsername(basketData);
        if (basketUsername && normalizeUsername(basketUsername) !== normalizeUsername(trimmedUsername)) {
            return NextResponse.json({ requiresLogout: true });
        }

        if (basketData.complete === true) {
            const newBasket = await createBasket({ username: trimmedUsername, origin: safeOrigin });
            return NextResponse.json({ basket: newBasket, refreshed: true, relogin: true });
        }

        return NextResponse.json({ basket, refreshed: false });
    } catch (error) {
        return NextResponse.json(
            { message: error?.message || 'Failed to validate basket' },
            { status: 500 }
        );
    }
}
