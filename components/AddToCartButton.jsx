'use client'

import { ActionIcon, Box, Button, Group, Image, Stack, Text, TextInput, Title, darken } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { TbGift, TbShoppingCart } from "react-icons/tb";
import { useBasket } from "../contexts/BasketContext";
import { useSettings } from "../contexts/SettingsContext";
import LoginForm from "./LoginForm";
import { useTranslations } from 'next-intl';

function GiftCardEmailPrompt({ onSubmit, initialValue = "" }) {
    const form = useForm({
        initialValues: {
            email: initialValue
        },
        validate: {
            email: (value) => (/\S+@\S+\.\S+/.test(value) ? null : "Ingrese un correo electrónico válido")
        }
    });

    return (
        <form onSubmit={form.onSubmit(({ email }) => onSubmit(email))}>
            <Stack>
                <Title order={2} c="bright" mb="md" ta="center">Destinatario de la tarjeta de regalo</Title>
                <Text c="dimmed" ta="center" mb="sm">Ingrese la dirección de correo electrónico para enviar esta tarjeta de regalo.</Text>
                <TextInput
                    type="email"
                    size="lg"
                    placeholder="name@example.com"
                    autoFocus
                    {...form.getInputProps('email')}
                />
                <Button type="submit" color="primary" fullWidth size="lg">AGREGAR AL CARRITO</Button>
            </Stack>
        </form>
    );
}

function GiftPackagePrompt({ onSubmit, initialValue = "" }) {
    const form = useForm({
        initialValues: {
            username: initialValue
        },
        validate: {
            username: (value) => {
                const trimmed = value.trim();
                if (trimmed.length < 2) {
                    return "Ingrese un nombre de usuario válido";
                }
                return null;
            }
        }
    });

    return (
        <form onSubmit={form.onSubmit(({ username }) => onSubmit(username.trim()))}>
            <Stack>
                <Text mt="2rem" mb="1rem" size="lg" fw={700}>Paquete de regalo</Text>
                <Group wrap="nowrap" mb="0.8rem">
                    <Image src="https://minotar.net/avatar/steve" alt="Minecraft" h={42} w={42} fit="contain" />
                    <TextInput
                        w="100%"
                        size="lg"
                        placeholder="Ingrese nombre de usuario"
                        autoFocus
                        {...form.getInputProps('username')}
                    />
                </Group>
                <Group justify="flex-end">
                    <Button type="submit">Paquete de regalo</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function AddToCartButton({ package_id, quantity = 1, category_id, children, extraProps, onComplete, overrideText }) {
    const t = useTranslations('Store');
    const [loading, setLoading] = useState(false);
    const { basket, addToBasket } = useBasket();
    const settings = useSettings();

    const isGiftCardCategory = () => {
        const configuredCategoryId = settings?.gift_card_category_id;
        if (!configuredCategoryId || !category_id) return false;
        return String(configuredCategoryId) === String(category_id);
    };

    const promptGiftCardEmail = () => {
        return new Promise((resolve) => {
            let settled = false;
            const resolveOnce = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const modalId = modals.open({
                size: "50rem",
                padding: "4rem",
                styles: {
                    header: {
                        backgroundColor: "transparent",
                    },
                },
                onClose: () => resolveOnce(null),
                children: (
                    <GiftCardEmailPrompt
                        onSubmit={(email) => {
                            resolveOnce(email);
                            modals.close(modalId);
                        }}
                    />
                )
            });
        });
    };

    const promptGiftUsername = () => {
        return new Promise((resolve) => {
            let settled = false;
            const resolveOnce = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const modalId = modals.open({
                size: "50rem",
                padding: "4rem",
                styles: {
                    header: {
                        backgroundColor: "transparent",
                    },
                },
                onClose: () => resolveOnce(null),
                children: (
                    <GiftPackagePrompt
                        onSubmit={(username) => {
                            resolveOnce(username);
                            modals.close(modalId);
                        }}
                    />
                )
            });
        });
    };

    const showSuccessNotification = (message) => {
        notifications.show({
            title: t('productAdded'),
            message,
            styles: {
                root: {
                    backgroundColor: "var(--mantine-color-primary-5)",
                    boxShadow: "0px 2px 0px 1px " + darken("var(--mantine-color-primary-5)", 0.5),
                },
                title: {
                    color: "var(--app-neutral-black)",
                    fontWeight: 700,
                },
                closeButton: {
                    color: "var(--app-neutral-black)",
                },
                description: {
                    color: "var(--app-neutral-black)",
                }
            }
        });
    };

    const showErrorNotification = (message) => {
        notifications.show({
            title: t('error'),
            message,
            styles: {
                root: {
                    backgroundColor: "var(--app-notification-error-color)",
                    boxShadow: "0px 2px 0px 1px var(--app-notification-error-shadow-color)"
                },
                title: {
                    color: "var(--app-neutral-white)",
                    fontWeight: 700,
                },
                closeButton: {
                    color: "var(--app-neutral-white)",
                },
                description: {
                    color: "var(--app-neutral-white)",
                }
            }
        });
    };

    const ensureAuthenticated = () => {
        if (basket?.data?.ident) {
            return true;
        }

        modals.open({
            children: <LoginForm onLogin={() => window.location.reload()} />,
            withCloseButton: false,
            onClose: () => setLoading(false),
            size: "50rem",
            padding: "4rem"
        });

        return false;
    };

    const handleAddToCart = async (event) => {
        event.stopPropagation();
        setLoading(true);

        try {
            if (!ensureAuthenticated()) {
                return;
            }

            let giftCardEmail = null;

            if (isGiftCardCategory()) {
                giftCardEmail = await promptGiftCardEmail();
                if (!giftCardEmail) {
                    return;
                }
            }

            const data = await addToBasket(basket.data.ident, package_id, quantity, { categoryId: category_id, giftCardEmail });
            showSuccessNotification(data.message);
            onComplete?.();
        } catch (error) {
            if (error?.requiresGiftCardEmail) {
                const giftCardEmail = await promptGiftCardEmail();
                if (giftCardEmail) {
                    try {
                        const data = await addToBasket(basket.data.ident, package_id, quantity, { categoryId: category_id, giftCardEmail });
                        showSuccessNotification(data.message);
                        onComplete?.();
                        return;
                    } catch (retryError) {
                        showErrorNotification(retryError.message);
                        return;
                    }
                }
                return;
            }

            showErrorNotification(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGiftPackage = async (event) => {
        event.stopPropagation();
        setLoading(true);

        try {
            if (!ensureAuthenticated()) {
                return;
            }

            const targetUsername = await promptGiftUsername();
            if (!targetUsername) {
                return;
            }

            const data = await addToBasket(
                basket.data.ident,
                package_id,
                quantity,
                {
                    categoryId: category_id,
                    targetUsername
                }
            );

            showSuccessNotification(data.message);
            onComplete?.();
            modals.closeAll();
        } catch (error) {
            showErrorNotification(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={{ cursor: "pointer" }} onClick={handleAddToCart}>
            {children || (
                <Group mt="0.6rem" wrap="nowrap">
                    <Button
                        size="md"
                        bd="none"
                        w="100%"
                        leftSection={<TbShoppingCart size="1.4rem" />}
                        loading={loading}
                        {...extraProps}
                    >
                        {overrideText || t('addToCart')}
                    </Button>
                    {!isGiftCardCategory() && (
                        <ActionIcon
                            size="2.6rem"
                            bg="gold"
                            c="var(--app-primary-contrast-color)"
                            onClick={handleGiftPackage}
                            loading={loading}
                            style={{ boxShadow: "0px 2px 0px 1px var(--mantine-color-yellow-8)" }}
                            aria-label="Gift package"
                        >
                            <TbGift size="1.2rem" />
                        </ActionIcon>
                    )}
                </Group>
            )}
        </Box>
    );
}
