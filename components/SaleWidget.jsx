'use client'

import { alpha, Group, Paper, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function SaleWidget({ sale }) {
    const settings = useSettings();
    const [timeLeft, setTimeLeft] = useState(() => {
        const difference = sale.expire - Math.floor(Date.now() / 1000);
        const days = Math.floor(difference / (3600 * 24));
        const hours = Math.floor((difference % (3600 * 24)) / 3600);
        const minutes = Math.floor((difference % 3600) / 60);
        const seconds = difference % 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    });

    useEffect(() => {
        const countdown = () => {
            const currentTime = Math.floor(Date.now() / 1000);
            const expireTime = sale.expire;
            const difference = expireTime - currentTime;

            if (difference > 0) {
                const days = Math.floor(difference / (3600 * 24));
                const hours = Math.floor((difference % (3600 * 24)) / 3600);
                const minutes = Math.floor((difference % 3600) / 60);
                const seconds = difference % 60;
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Sale has ended');
            }
        };

        const interval = setInterval(countdown, 1000);
        return () => clearInterval(interval);
    }, [sale]);

    if (settings.sales.sale_banner_variant === "full") {
        return (
            <Paper bg={alpha("var(--mantine-color-primary-5)", 0.1)} bd="4px solid primary.5" p="1.4rem" mb="1rem">
                <Title fz="2.4rem" c="bright" order={2}>{sale.name}</Title>
                <Text fw={500} maw="26rem" size="xl" c="bright">Only <strong>{timeLeft}</strong> remaining!</Text>
            </Paper>
        );
    }

    if (settings.sales.sale_banner_variant === "compact") {
        return (
            <Paper bg={alpha("var(--mantine-color-primary-5)", 0.1)} bd="4px solid primary.5" p="1rem" mb="1rem">
                <Group justify="space-between">
                    <Title fz="2rem" c="bright" order={2}>{sale.name}</Title>
                    <Text fw={500} maw="26rem" size="xl" c="bright">Only <strong>{timeLeft}</strong> remaining!</Text>
                </Group>
            </Paper>
        );
    }
};