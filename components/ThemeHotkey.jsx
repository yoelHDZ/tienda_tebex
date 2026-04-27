'use client'

import { useHotkeys } from "@mantine/hooks";
import { useMantineColorScheme } from "@mantine/core";

export default function ThemeHotkey() {
    const colorScheme = useMantineColorScheme();

    useHotkeys([
        ['mod+J', () => colorScheme.toggleColorScheme()],
    ]);
}