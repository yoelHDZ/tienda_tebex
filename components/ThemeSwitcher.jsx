'use client'

import { ActionIcon, Box, Tooltip, useMantineColorScheme } from '@mantine/core';
import { TbMoon, TbSun } from 'react-icons/tb';

export default function ThemeSwitcher() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const toggleTheme = () => {
        setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
    };

    return (
        <Tooltip label="Toggle color scheme">
            <ActionIcon style={{ border: "none" }} size="lg" variant="light" onClick={toggleTheme}>
                <Box lightHidden>
                    <TbMoon color="var(--app-neutral-white)" size={20} />
                </Box>
                <Box darkHidden>
                    <TbSun color="var(--app-neutral-gray-333)" size={20} />
                </Box>
            </ActionIcon>
        </Tooltip>
    );
}