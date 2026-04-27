"use client";

import { Button, Paper, Title, Text, Group, Box } from "@mantine/core";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div style={{  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box shadow="md" style={{ maxWidth: 420, width: "100%", textAlign: "center", position: "relative" }}>
        <Title order={1} style={{ fontSize: 64, fontWeight: 900, color: "var(--mantine-color-primary-5)", marginBottom: 8 }}>
          {t('404')}
        </Title>
        <Text size="lg" style={{ fontWeight: 700, marginBottom: 8 }}>
          {t('pageNotFound')}
        </Text>
        <Text c="dimmed" size="md" style={{ marginBottom: 24 }}>
          {t('sorry')}
        </Text>
        <Group justify="center">
          <Button component={Link} href="/" size="md" variant="filled">
            {t('goHome')}
          </Button>
        </Group>
      </Box>
    </div>
  );
} 