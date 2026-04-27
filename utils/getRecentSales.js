import axios from "axios";

export async function getRecentSales() {
    let recentPackages = [];
    if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        recentPackages = [
            { id: "6589678", purchasedAt: "2024-12-18T15:02:00+0000" },
            { id: "6589679", purchasedAt: "2024-12-18T15:15:00+0000" },
            { id: "6589681", purchasedAt: "2024-12-18T15:27:00+0000" },
            { id: "6589682", purchasedAt: "2024-12-18T15:43:00+0000" }
        ];
    } else {
        if (!process.env.SERVER_SECRET) return [];

        try {
            const res = await axios.get('https://plugin.tebex.io/payments', {
                headers: {
                    "X-Tebex-Secret": process.env.SERVER_SECRET,
                }
            });

            const payments = Array.isArray(res.data) ? res.data : [];
            recentPackages = payments
                .filter(payment => payment.status === "Complete")
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .flatMap(payment => payment.packages.map(pkg => ({
                    id: pkg.id,
                    purchasedAt: payment.date
                })))
                .slice(0, 10);
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    try {
        const packageDetails = await Promise.all(recentPackages.map(async (pkg) => {
            const res = await axios.get(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/packages/${pkg.id}`);
            return {
                ...res.data,
                purchasedAt: pkg.purchasedAt
            };
        }));

        return packageDetails;
    } catch (err) {
        console.log(err);
        return [];
    }
}
