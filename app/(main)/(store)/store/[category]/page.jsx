import { Badge, Box, Grid, GridCol, Group, Image, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import AddToCartButton from "../../../../../components/AddToCartButton";
import RankPopup from "../../../../../components/RankPopup";
import SaleWidget from "../../../../../components/SaleWidget";
import { settings } from "../../../../../utils/settings";
import { getCategories } from "../../../../../utils/getCategories";
import { getSale } from "../../../../../utils/getSale";
import { tebexClient } from "../../../../../utils/tebexClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }) {
    const { category } = await params;
    const allCategories = await getCategories();
    const sale = await getSale();
    const tStore = await getTranslations('Store');

    const selectedCategory = allCategories.find(cat => cat.slug === category);

    let allPackages = [];
    if (selectedCategory) {
        allPackages = await tebexClient(`categories/${selectedCategory.id}?includePackages=1`);
    }

    if (selectedCategory) {
        return (
            <>
                {sale && <SaleWidget sale={sale} />}
                <Paper bg="gold" p="0.2rem 0.8rem" mb="0.8rem" w="fit-content" pos="relative" style={{ zIndex: 2 }}>
                    <Title fz="1.4rem" c="var(--app-neutral-black)" order={2}>{tStore('all')} {selectedCategory.name}</Title>
                </Paper>
                <SimpleGrid grow mb="4rem" cols={{ base: 1, md: 2, lg: 3 }}>
                    {allPackages?.data?.packages?.map((rank) => (
                        <RankPopup key={rank.id} rank={rank}>
                            <Paper pos="relative" mih="22rem" style={{ cursor: 'pointer' }}>
                                <Group justify="center">
                                    <Image mt="1rem" src={rank.image} alt={rank.name} mah="12rem" w="auto" />
                                </Group>
                                <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                                    <Group justify="space-between" gap="0.4rem">
                                        <Text c="bright" size="xl" fw={600}>{rank.name}</Text>
                                        <Badge size="lg" c="var(--app-neutral-white)" color="var(--app-dark-background-color)">
                                            {rank.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.currency_symbol}{Number(rank.total_price + rank.discount).toFixed(2)}</Text>}
                                            &nbsp;{settings.currency_symbol}{Number(rank.total_price).toFixed(2)}
                                        </Badge>
                                    </Group>
                                    <AddToCartButton package_id={rank.id} quantity={1} category_id={selectedCategory.id} />
                                </Box>
                            </Paper>
                        </RankPopup>
                    ))}
                </SimpleGrid>
            </>
        );
    }
}

export async function generateMetadata({ params }) {
    const newParams = await params;
    const uppercaseCategory = newParams.category.charAt(0).toUpperCase() + newParams.category.slice(1);
    return {
        title: uppercaseCategory + " | Store | " + settings.server_name,
        description: "Buy " + uppercaseCategory + " from the " + settings.server_name + " store!",
        openGraph: {
            title: uppercaseCategory + " | Store | " + settings.server_name,
            description: "Buy " + uppercaseCategory + " from the " + settings.server_name + " store!",
        }
    }
}
