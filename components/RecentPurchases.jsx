'use client';

import { Paper, Title, Group, Box, Text, Badge, Image } from '@mantine/core';
import { Carousel, CarouselSlide } from '@mantine/carousel';
import { getTimeAgo } from '../utils/getTimeAgo';
import RankPopup from './RankPopup';
import { useSettings } from '../contexts/SettingsContext';
import AddToCartButton from './AddToCartButton';

export default function RecentPurchases({ recentPurchases }) {
    const settings = useSettings();
    return (recentPurchases && recentPurchases.length > 0) && (
        <>
            <Paper mt="2rem" bg="gold" p="0.2rem 0.8rem" mb="-0.4rem" w="fit-content" pos="relative" style={{ zIndex: 2 }}>
                <Title fz="1.2rem" c="var(--app-neutral-black)" order={2}>Your recent purchases</Title>
            </Paper>
            <Carousel
                mb="2rem"
                slideGap="1rem"
                align="start"
                h={365}
                slideSize={{ base: "100%", sm: "50%", md: "32%" }}
            >
                {recentPurchases?.map((item) => (
                    <CarouselSlide key={item.txn_id}>
                        <RankPopup rank={item.productInfo}>
                            <Paper pos="relative" mih="22rem" style={{ cursor: 'pointer' }}>
                                <Badge className="recent-purchase-badge" radius={4} variant="light" pos="absolute" top="0.5rem" right="0.5rem" size="lg" color="primary.5">
                                    {getTimeAgo(item.date)}
                                </Badge>
                                <Group justify="center">
                                    <Image mt="2rem" src={item.productInfo.image} alt={item.productInfo.name} mah="12rem" w="auto" />
                                </Group>
                                <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                                    <Group justify="space-between" gap="0.4rem">
                                        <Text c="bright" size="xl" fw={600}>{item.productInfo.name}</Text>
                                        <Badge size="lg" c="var(--app-neutral-white)" color="var(--app-dark-background-color)">
                                            {item.productInfo.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.currency_symbol}{Number(item.productInfo.total_price + item.productInfo.discount).toFixed(2)}</Text>}
                                            &nbsp;{settings.currency_symbol}{Number(item.productInfo.total_price).toFixed(2)}
                                        </Badge>
                                    </Group>
                                    <AddToCartButton overrideText="Buy again" package_id={item.productInfo.id} quantity={1} />
                                </Box>
                            </Paper>
                        </RankPopup>
                    </CarouselSlide>
                ))}
            </Carousel>
        </>
    )
}