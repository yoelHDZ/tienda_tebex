'use client'

import { Box, Combobox, Group, Image, Paper, Stack, Text, useCombobox } from '@mantine/core';
import { useMemo } from 'react';
import { TbChevronDown, TbDeviceGamepad2 } from 'react-icons/tb';
import { useGamemode } from '../contexts/GamemodeContext';

export default function GamemodeSelector({ categories }) {
  const { enabled, gamemodes, activeGamemode, activeGm, switchGamemode, hydrated } = useGamemode();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const categoryMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(categories) ? categories : []).forEach(c => map.set(String(c.id), c));
    return map;
  }, [categories]);

  if (!enabled || gamemodes.length === 0 || !hydrated) return null;

  const currentCategory = activeGm ? categoryMap.get(String(activeGm.category_id)) : null;

  return (
    <Paper mb="1rem" className="gamemode-selector-widget">
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          switchGamemode(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <Box
            onClick={() => combobox.toggleDropdown()}
            className="gamemode-selector-trigger pointer"
            p="sm"
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                {currentCategory?.image_url ? (
                  <Image src={currentCategory.image_url} alt={activeGm?.name || ''} w={32} h={32} fit="contain" />
                ) : (
                  <Box
                    w={32}
                    h={32}
                    style={{
                      borderRadius: 6,
                      backgroundColor: activeGm?.colour || 'var(--mantine-color-primary-5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TbDeviceGamepad2 size="1.2rem" color="var(--app-neutral-white)" />
                  </Box>
                )}
                <div>
                  <Text size="xs" c="dimmed" lh={1.2}>Gamemode</Text>
                  <Text size="md" fw={700} c="bright" lh={1.3}>{activeGm?.name || 'Select'}</Text>
                </div>
              </Group>
              <TbChevronDown
                size="1.2rem"
                style={{
                  transition: 'transform 200ms ease',
                  transform: combobox.dropdownOpened ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </Group>
          </Box>
        </Combobox.Target>

      <Combobox.Dropdown className="gamemode-selector-dropdown">
          <Combobox.Options>
            <Stack gap="0.2rem">
              {gamemodes.map((gm) => {
                const cat = categoryMap.get(String(gm.category_id));
                const isActive = gm.id === activeGamemode;
                return (
                  <Combobox.Option value={gm.id} key={gm.id} className={isActive ? 'gamemode-option-active' : ''}>
                    <Group gap="sm" wrap="nowrap" p={4}>
                      {cat?.image_url ? (
                        <Image src={cat.image_url} alt={gm.name} w={28} h={28} fit="contain" />
                      ) : (
                        <Box
                          w={28}
                          h={28}
                          style={{
                            borderRadius: 6,
                            backgroundColor: gm.colour || 'var(--app-dark-surface-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <TbDeviceGamepad2 size="1rem" color="var(--app-neutral-white)" />
                        </Box>
                      )}
                      <div>
                        <Text size="sm" fw={600} c="bright">{gm.name}</Text>
                        {cat && <Text size="xs" c="dimmed" lh={1.2}>{cat.description || cat.name}</Text>}
                      </div>
                      <Box
                        ml="auto"
                        w={10}
                        h={10}
                        style={{
                          borderRadius: '50%',
                          backgroundColor: gm.colour || 'var(--app-dark-surface-border-color)',
                          flexShrink: 0,
                          boxShadow: isActive ? `0 0 0 2px ${gm.colour ? `${gm.colour}40` : 'color-mix(in srgb, var(--app-dark-surface-border-color) 25%, transparent)'}` : 'none',
                        }}
                      />
                    </Group>
                  </Combobox.Option>
                );
              })}
            </Stack>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Paper>
  );
}
