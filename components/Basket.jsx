'use client'

import { ActionIcon, Anchor, Box, Button, Divider, Drawer, Group, Image, Paper, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { TbArrowLeft, TbBasket, TbChevronDown, TbChevronUp, TbX } from "react-icons/tb";
import { useBasket } from "../contexts/BasketContext";
import { useSettings } from "../contexts/SettingsContext";
import { useTranslations } from "next-intl";

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK', 'DKK'];

export default function Basket({ user, forceOpen, onClose, hideIcon, onOpen }) {
    const { basket, applyCoupon, removeCoupon, applyGiftCard, removeGiftCard, applyCreatorCode, removeCreatorCode, changeBasketCurrency } = useBasket();
    const settings = useSettings();
    const [opened, setOpened] = useState(false);
    const t = useTranslations('Basket');
    const [couponCode, setCouponCode] = useState("");
    const [giftCard, setGiftCard] = useState("");
    const [creatorCode, setCreatorCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const isCurrencySwitcherEnabled = settings?.allow_currency_switcher !== false;
    const fixedCurrency = String(settings?.fixed_currency || 'USD').toUpperCase();
    const resolvedCurrency = isCurrencySwitcherEnabled ? currency : fixedCurrency;
    const basketCodeInputStyles = {
        input: {
            backgroundColor: "var(--mantine-color-dark-6)",
            border: "1px solid var(--mantine-color-dark-4)",
            color: "var(--mantine-color-bright)"
        }
    };

    useEffect(() => {
        if (!isCurrencySwitcherEnabled) {
            setCurrency(fixedCurrency);
            return;
        }

        if (basket?.data?.currency) {
            setCurrency(String(basket.data.currency).toUpperCase());
        }
    }, [basket?.data?.currency, isCurrencySwitcherEnabled, fixedCurrency]);

    useEffect(() => {
        if (isCurrencySwitcherEnabled || !basket?.data?.ident) {
            return;
        }

        if (String(basket?.data?.currency || '').toUpperCase() === fixedCurrency) {
            return;
        }

        setSubmitting(true);
        changeBasketCurrency(basket.data.ident, fixedCurrency)
            .catch((err) => {
                notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to change currency' });
            })
            .finally(() => {
                setSubmitting(false);
            });
    }, [isCurrencySwitcherEnabled, basket?.data?.ident, basket?.data?.currency, fixedCurrency, changeBasketCurrency]);

    const basePrice = useMemo(() => {
        if (typeof basket?.data?.base_price === 'number') {
            return basket.data.base_price;
        }
        return basket?.data?.packages?.reduce((acc, item) => acc + (item?.in_basket?.price || 0) * (item?.in_basket?.quantity || 0), 0) || 0;
    }, [basket?.data?.base_price, basket?.data?.packages]);

    const salesTax = typeof basket?.data?.sales_tax === 'number' ? basket.data.sales_tax : 0;
    const totalPrice = typeof basket?.data?.total_price === 'number' ? basket.data.total_price : basePrice + salesTax;
    const discountTotal = Math.max((basePrice + salesTax) - totalPrice, 0);

    const coupons = basket?.data?.coupons || [];
    const giftcards = basket?.data?.giftcards || [];
    const creatorCodeApplied = basket?.data?.creator_code || null;
    const selectedCurrency = String(resolvedCurrency || basket?.data?.currency || 'USD').toUpperCase();

    const formatMoney = (amount) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: selectedCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(amount || 0));
        } catch {
            return `${selectedCurrency} ${Number(amount || 0).toFixed(2)}`;
        }
    };

    return (
        <>
            {!hideIcon && <ActionIcon onClick={() => {
                onOpen?.();
                setOpened(true);
            }} bg="var(--app-primary-color)" c="var(--app-neutral-black)" w="3rem" h="3rem" pos="relative">
                {basket?.data?.packages?.length > 0 && (
                    <Box ta="center" fw={700} fz="sm" pos="absolute" bottom={4} right={3} w="1rem" h="1.2rem" bg="primary.5" c="var(--app-neutral-black)" radius="50%" style={{ zIndex: 2 }}>
                        {basket?.data?.packages?.length}
                    </Box>
                )}
                <TbBasket color="var(--app-neutral-black)" style={{ cursor: "pointer" }} size="1.8rem" />
            </ActionIcon>}

            <Drawer classNames={{ content: "drawer-content" }} zIndex={100} styles={{ header: { display: "none" }, body: { height: "100%" } }} offset="1rem" position="right" opened={opened || forceOpen} onClose={() => {
                setOpened(false);
                onClose?.();
            }}>
                <ActionIcon c="var(--app-neutral-black)" bg="var(--app-neutral-white)" pos="absolute" top="1rem" left="1rem" style={{ zIndex: 100000 }} onClick={() => {
                    setOpened(false);
                    onClose?.();
                }}>
                    <TbArrowLeft />
                </ActionIcon>
                <Stack justify="space-between" h="100%">
                    <ScrollArea offsetScrollbars type="always" my="1rem" mah="calc(100% - 7rem)" h="calc(100% - 7rem)">
                        <Stack>
                            {basket?.data?.packages.map((item, index) => (
                                <BasketItem item={item} basketIdent={basket.data.ident} currency={selectedCurrency} key={index} />
                            ))}
                        </Stack>
                    </ScrollArea>
                    <div>
                        <Stack mb="0.8rem" gap="0.6rem">
                            {isCurrencySwitcherEnabled && (
                                <Select
                                    label="Moneda"
                                    data={SUPPORTED_CURRENCIES}
                                    searchable
                                    value={selectedCurrency}
                                    onChange={async (value) => {
                                        if (!value || !basket?.data?.ident || value === selectedCurrency) return;
                                        setSubmitting(true);
                                        setCurrency(value);
                                        try {
                                            await changeBasketCurrency(basket.data.ident, value);
                                        } catch (err) {
                                            setCurrency(selectedCurrency);
                                            notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to change currency' });
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                    disabled={!basket?.data?.ident || submitting}
                                />
                            )}
                            <Group wrap="nowrap" gap="0.4rem">
                                <TextInput
                                    flex={1}
                                    placeholder="Codigo de cupon"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.currentTarget.value)}
                                    styles={basketCodeInputStyles}
                                />
                                <Button loading={submitting} onClick={async () => {
                                    if (!basket?.data?.ident || !couponCode) return;
                                    setSubmitting(true);
                                    try {
                                        await applyCoupon(basket.data.ident, couponCode);
                                        setCouponCode("");
                                    } catch (err) {
                                        notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al aplicar el cupon' });
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}>Aplicar</Button>
                            </Group>
                            {coupons.map((coupon, index) => {
                                const couponLabel = String(
                                    coupon?.coupon_code ||
                                    coupon?.code ||
                                    coupon?.coupon ||
                                    coupon?.name ||
                                    coupon?.id ||
                                    ''
                                ).trim();
                                return (
                                <Paper key={couponLabel || String(index)} withBorder p="xs">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="sm" c="bright">Cupon: {couponLabel || 'Applied'}</Text>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            style={{ boxShadow: 'none' }}
                                            onClick={async () => {
                                                if (!basket?.data?.ident) return;
                                                setSubmitting(true);
                                                try {
                                                    await removeCoupon(basket.data.ident);
                                                } catch (err) {
                                                    notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al eliminar el cupon' });
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                        >
                                            <TbX size="1rem" />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                                );
                            })}
                            <Group wrap="nowrap" gap="0.4rem">
                                <TextInput
                                    flex={1}
                                    placeholder="Numero de tarjeta de regalo"
                                    value={giftCard}
                                    onChange={(e) => setGiftCard(e.currentTarget.value)}
                                    styles={basketCodeInputStyles}
                                />
                                <Button loading={submitting} onClick={async () => {
                                    if (!basket?.data?.ident || !giftCard) return;
                                    setSubmitting(true);
                                    try {
                                        await applyGiftCard(basket.data.ident, giftCard);
                                        setGiftCard("");
                                    } catch (err) {
                                        notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al aplicar la tarjeta de regalo' });
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}>Aplicar</Button>
                            </Group>
                            {giftcards.map((card) => (
                                <Paper key={card.card_number} withBorder p="xs">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="sm" c="bright">Tarjeta de regalo: {card.card_number}</Text>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={async () => {
                                                if (!basket?.data?.ident) return;
                                                setSubmitting(true);
                                                try {
                                                    await removeGiftCard(basket.data.ident, card.card_number);
                                                } catch (err) {
                                                    notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al eliminar la tarjeta de regalo' });
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                        >
                                            <TbX size="1rem" />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}
                            <Group wrap="nowrap" gap="0.4rem">
                                <TextInput
                                    flex={1}
                                    placeholder="Codigo de creador"
                                    value={creatorCode}
                                    onChange={(e) => setCreatorCode(e.currentTarget.value)}
                                    styles={basketCodeInputStyles}
                                />
                                <Button loading={submitting} onClick={async () => {
                                    if (!basket?.data?.ident || !creatorCode) return;
                                    setSubmitting(true);
                                    try {
                                        await applyCreatorCode(basket.data.ident, creatorCode);
                                        setCreatorCode("");
                                    } catch (err) {
                                        notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al aplicar el codigo de creador' });
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}>Aplicar</Button>
                            </Group>
                            {creatorCodeApplied && (
                                <Paper withBorder p="xs">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="sm" c="bright">Codigo de Creador: {creatorCodeApplied}</Text>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={async () => {
                                                if (!basket?.data?.ident) return;
                                                setSubmitting(true);
                                                try {
                                                    await removeCreatorCode(basket.data.ident);
                                                } catch (err) {
                                                    notifications.show({ styles: { title: { color: 'var(--app-neutral-black)' }, description: { color: 'var(--app-neutral-black)' } }, color: 'red', title: 'Error', message: err?.message || 'Fallo al eliminar el codigo de creador' });
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                        >
                                            <TbX size="1rem" />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            )}
                        </Stack>
                        <Paper withBorder p="sm" mb="0.8rem">
                            <Stack gap="0.2rem">
                                <Group justify="space-between" wrap="nowrap">
                                    <Text c="dimmed" size="sm">Sub-Total</Text>
                                    <Text c="bright" size="sm">{formatMoney(basePrice)}</Text>
                                </Group>
                                <Group justify="space-between" wrap="nowrap">
                                    <Text c="dimmed" size="sm">Impuesto</Text>
                                    <Text c="bright" size="sm">{formatMoney(salesTax)}</Text>
                                </Group>
                                {discountTotal > 0 && (
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text c="dimmed" size="sm">Descuento</Text>
                                        <Text c="green" size="sm">-{formatMoney(discountTotal)}</Text>
                                    </Group>
                                )}
                                <Divider my="0.2rem" />
                                <Group justify="space-between" wrap="nowrap">
                                    <Text c="bright" size="lg" fw={600}>Costo Total</Text>
                                    <Text c="bright" size="lg" fw={700}>{formatMoney(totalPrice)}</Text>
                                </Group>
                            </Stack>
                        </Paper>
                        <Box>
                            <Button component={Anchor} href={basket?.data?.links?.checkout || "#"} disabled={!basket?.data?.packages?.length > 0} w="100%" size="lg" color="var(--app-primary-color)">{t('checkout')}</Button>
                        </Box>
                    </div>
                </Stack>
            </Drawer>
        </>
    )
}

function BasketItem({ item, basketIdent, currency }) {
    const { updateQuantity, removeFromBasket } = useBasket();
    const [loading, setLoading] = useState(false);
    const totalPrice = (item?.in_basket?.price || 0) * (item?.in_basket?.quantity || 0);

    const formatMoney = (amount) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: String(currency || 'USD').toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(amount || 0));
        } catch {
            return `${String(currency || 'USD').toUpperCase()} ${Number(amount || 0).toFixed(2)}`;
        }
    };

    const handleUpdateQuantity = (quantity) => {
        setLoading(true);
        if (quantity < 1) {
            removeFromBasket(basketIdent, item.id);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            return;
        }
        updateQuantity(basketIdent, item.id, quantity);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }

    return (
        <Paper h="16rem" pos="relative">
            <Image src={item.image} alt={item.name} h="12rem" mx="auto" w="auto" />
            <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                <Group wrap="nowrap" justify="space-between" gap="0.4rem">
                    <Text c="bright" size="xl" fw={600}>{item.name}</Text>
                    <Group gap="0.4rem">
                        <Paper px="xs" py={4} withBorder>
                            <Text size="sm" c="bright">{formatMoney(totalPrice)}</Text>
                        </Paper>
                        <Paper px="xs" py={4} bg="primary.5">
                            <Text size="sm" c="var(--app-neutral-black)" fw={700}>x{item.in_basket.quantity}</Text>
                        </Paper>
                        <Button.Group>
                            <Button loading={loading} h="1.6rem" p="0 0.2rem" variant="default" onClick={() => handleUpdateQuantity(item.in_basket.quantity - 1)}>
                                <TbChevronDown color="var(--mantine-color-red-text)" />
                            </Button>
                            <Button loading={loading} h="1.6rem" p="0 0.2rem" variant="default" onClick={() => handleUpdateQuantity(item.in_basket.quantity + 1)}>
                                <TbChevronUp color="var(--mantine-color-teal-text)" />
                            </Button>
                        </Button.Group>
                    </Group>
                </Group>
            </Box>
        </Paper>
    )
}

