import { NextResponse } from "next/server";
import { getSettings } from "../../../utils/settings";

export async function POST(req) {
    const { basketIdent, package_id, quantity, discordId, categoryId, giftCardEmail, targetUsername } = await req.json();
    const settings = getSettings();
    const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    const configuredGiftCardCategoryId = String(settings?.gift_card_category_id || '');

    let packageData = null;
    if (token && configuredGiftCardCategoryId) {
        packageData = await fetch(`https://headless.tebex.io/api/accounts/${token}/packages/${package_id}`, {
            method: 'GET'
        }).then(res => res.json()).then((res) => res?.data || res).catch(() => null);
    }

    const resolvedCategoryId = String(
        categoryId ||
        packageData?.category_id ||
        packageData?.category?.id ||
        ''
    );
    const isGiftCardPackage = Boolean(configuredGiftCardCategoryId) && resolvedCategoryId === configuredGiftCardCategoryId;

    if (isGiftCardPackage && !giftCardEmail) {
        return NextResponse.json(
            { message: "Please enter the gift card recipient email", requiresGiftCardEmail: true },
            { status: 400 }
        );
    }

    const variableData = {};
    if (discordId) {
        variableData.discord_id = discordId;
    }

    if (isGiftCardPackage && giftCardEmail) {
        variableData.giftcard_to = giftCardEmail;
    }

    if (targetUsername) {
        variableData.target_username = targetUsername;
    }

    const response = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            package_id: package_id,
            quantity: quantity,
            variable_data: variableData
        }),
    }).then(res => res.json()).catch(err => console.log(err));

    if (response.status === 400) {
        const detail = String(response?.detail || '');
        const title = String(response?.title || '');
        const requiresGiftCardEmail = detail.toLowerCase().includes('invalid options') && title.toLowerCase().includes('email');
        return NextResponse.json({ message: response.detail, requiresGiftCardEmail }, { status: 400 });
    }

    return NextResponse.json({ basket: response, message: "This product has been added to your cart" });
}