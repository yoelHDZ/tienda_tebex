import axios from "axios";
import { settings } from "./settings";

export async function getFeaturedPackages() {
    const packageIds = settings.featured_package_ids;

    try {
        const packageDetails = await Promise.all(packageIds.map(async (id) => {
            const res = await axios.get(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/packages/${id}`);
            return res.data;
        }));

        return packageDetails;
    } catch (err) {
        console.log(err);
        return [];
    }
}
