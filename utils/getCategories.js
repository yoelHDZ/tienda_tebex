import { tebexClient } from "./tebexClient";

export async function getCategories() {
    const categories = await tebexClient("categories?includePackages=1");
    return Array.isArray(categories?.data) ? categories.data : [];
}

