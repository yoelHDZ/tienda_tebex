import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Badge, Box, Group, Image, Paper, Text, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import AddToCartButton from "../../../../components/AddToCartButton";
import RankPopup from "../../../../components/RankPopup";
import SaleWidget from "../../../../components/SaleWidget";
import { settings } from "../../../../utils/settings";
import { getFeaturedPackages } from "../../../../utils/getFeaturedPackages";
import { getRecentSales } from "../../../../utils/getRecentSales";
import { getSale } from "../../../../utils/getSale";
import { getTimeAgo } from "../../../../utils/getTimeAgo";

export const metadata = {
    title: "Store | " + settings.server_name,
    description: "Buy ranks from the " + settings.server_name + " store!",
}

export default async function Page() {
    const recentSales = await getRecentSales();
    const featuredPackages = await getFeaturedPackages();
    const sale = await getSale();

    const t = await getTranslations('Store');

    return (
        <>
            {sale && <SaleWidget sale={sale} />}
            
            <Paper bg="gold" p="0.2rem 0.8rem" mb="-0.4rem" w="fit-content" pos="relative" style={{ zIndex: 2 }}>
                <Title fz="1.2rem" c="var(--app-neutral-black)" order={2}>{t('featuredPackages')}</Title>
            </Paper>
            <Carousel
                slideGap="1rem"
                h={365}
                align="start"
                mb="1rem"
                slideSize={{ base: "100%", sm: "50%", md: "35%" }}
            >
                {featuredPackages?.map((item) => (
                    <CarouselSlide key={item.data.id}>
                        <RankPopup rank={item.data}>
                            <Paper pos="relative" mih="22rem" style={{ cursor: 'pointer' }}>
                                <Group justify="center">
                                    <Image mt="2rem" src={item.data.image} alt={item.data.name} mah="12rem" w="auto" />
                                </Group>
                                <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                                    <Group justify="space-between" gap="0.4rem">
                                        <Text c="bright" size="xl" fw={600}>{item.data.name}</Text>
                                        <Badge size="lg" c="var(--app-neutral-white)" color="var(--app-dark-background-color)">
                                            {item.data.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.currency_symbol}{Number(item.data.total_price + item.data.discount).toFixed(2)}</Text>}
                                            &nbsp;{settings.currency_symbol}{Number(item.data.total_price).toFixed(2)}
                                        </Badge>
                                    </Group>
                                    <AddToCartButton package_id={item.data.id} quantity={1} category_id={item.data.category_id || item.data.category?.id} />
                                </Box>
                            </Paper>
                        </RankPopup>
                    </CarouselSlide>
                ))}
            </Carousel>
            <Paper bg="gold" p="0.2rem 0.8rem" mb="-0.4rem" w="fit-content" pos="relative" style={{ zIndex: 2 }}>
                <Title fz="1.2rem" c="var(--app-neutral-black)" order={2}>{t('recentPurchases')}</Title>
            </Paper>
            <Carousel
                mb="1rem"
                slideGap="1rem"
                align="start"
                h={365}
                slideSize={{ base: "100%", sm: "50%", md: "35%" }}
            >
                {recentSales?.map((item, index) => (
                    <CarouselSlide key={`${item.data.id}-${item.purchasedAt}-${index}`}>
                        <RankPopup rank={item.data}>
                            <Paper pos="relative" mih="22rem" style={{ cursor: 'pointer' }}>
                                <Badge className="recent-purchase-badge" radius={4} variant="light" pos="absolute" top="0.5rem" right="0.5rem" size="lg" color="primary.5">
                                    {getTimeAgo(item.purchasedAt)}
                                </Badge>
                                <Group justify="center">
                                    <Image mt="2rem" src={item.data.image} alt={item.data.name} mah="12rem" w="auto" />
                                </Group>
                                <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                                    <Group justify="space-between" gap="0.4rem">
                                        <Text c="bright" size="xl" fw={600}>{item.data.name}</Text>
                                        <Badge size="lg" c="var(--app-neutral-white)" color="var(--app-dark-background-color)">
                                            {item.data.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.currency_symbol}{Number(item.data.total_price + item.data.discount).toFixed(2)}</Text>}
                                            &nbsp;{settings.currency_symbol}{Number(item.data.total_price).toFixed(2)}
                                        </Badge>
                                    </Group>
                                    <AddToCartButton package_id={item.data.id} quantity={1} category_id={item.data.category_id || item.data.category?.id} />
                                </Box>
                            </Paper>
                        </RankPopup>
                    </CarouselSlide>
                ))}
            </Carousel>
            <Paper p="2rem">
                <Title c="bright" mb="1rem">{t('Bienvenido', { server_name: settings.server_name })}</Title>
                <Text mb="2rem" size="lg">{t('descripcion', { server_name: settings.server_name })}</Text>

                <Title c="bright" mb="1rem" order={2}>{t('paymentMethodsTitle')}</Title>
                <Text size="lg" mb="1rem">{t('paymentMethods')}</Text>
                <Image src="https://i.ibb.co/SwZ2723/paymentmethds.png" alt="Metodos de pago" w="6rem" />
            </Paper>
        </>
    );
}