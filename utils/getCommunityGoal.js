import axios from "axios";

export async function getCommunityGoal() {
    if (!process.env.SERVER_SECRET) return null;

    try {
        const response = await axios.get("https://plugin.tebex.io/community_goals", {
            headers: {
                "X-Tebex-Secret": process.env.SERVER_SECRET
            }
        });
        const data = response.data;
        return data?.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}