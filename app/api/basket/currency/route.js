import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent, currency } = await req.json();
    const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;

    if (!basketIdent || !currency) {
        return NextResponse.json({ message: "Basket and currency are required" }, { status: 400 });
    }

    const endpoints = [
        `https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}`,
        `https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}/currency`
    ];
    const methods = ["PATCH", "PUT", "POST"];

    for (const endpoint of endpoints) {
        for (const method of methods) {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ currency })
            });

            if (response.ok) {
                const data = await response.json().catch(() => ({}));
                return NextResponse.json({ basket: data, message: "Currency updated" });
            }
        }
    }

    return NextResponse.json(
        { message: "Currency switching is not available for this basket right now" },
        { status: 400 }
    );
}
