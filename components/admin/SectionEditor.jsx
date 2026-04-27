'use client'

import { ActionIcon, Box, Button, Card, Divider, Group, NumberInput, Paper, Radio, SimpleGrid, Stack, Switch, Text, TextInput, Textarea, Title, ColorInput, Select, MultiSelect, CloseButton } from '@mantine/core';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TbPlus, TbX, TbPencil, TbNews, TbTag, TbTarget } from 'react-icons/tb';
import { getCategories } from '../../utils/getCategories';

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

const formatLabel = (k) => {
  const spaced = String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  const titled = spaced.replace(/\b\w/g, (m) => m.toUpperCase());
  return titled
    .replace(/\bids\b/gi, 'IDs')
    .replace(/\burl\b/gi, 'URL')
    .replace(/\bip\b/gi, 'IP');
};

const VARIANT_FIELDS = {
  'sales.settings.sale_banner_variant': {
    label: 'Sale Banner Variant',
    defaultValue: 'full',
    options: [
      { value: 'full', label: 'Full', description: 'Large banner with title and countdown stacked vertically', icon: <TbTag size="1.4rem" /> },
      { value: 'compact', label: 'Compact', description: 'Slim single-row banner with title and countdown side by side', icon: <TbTag size="1.4rem" /> },
    ],
  },
  'blog.settings.blog_source': {
    label: 'Blog Source',
    defaultValue: 'GhostCMS',
    options: [
      { value: 'GhostCMS', label: 'Ghost CMS', description: 'Connect to an external Ghost CMS instance for your blog', icon: <TbNews size="1.4rem" /> },
      { value: 'Internal', label: 'Internal', description: 'Create and manage blog posts directly from this admin panel', icon: <TbPencil size="1.4rem" /> },
    ],
  },
  'community_goal.settings.variant': {
    label: 'Variant',
    defaultValue: 'bar',
    options: [
      { value: 'bar', label: 'Progress Bar', description: 'Horizontal progress bar with start and end labels', icon: <TbTarget size="1.4rem" /> },
      { value: 'ring', label: 'Ring', description: 'Circular ring showing progress as a filled arc', icon: <TbTarget size="1.4rem" /> },
      { value: 'semicircle', label: 'Semi Circle', description: 'Half-circle gauge filling from left to right', icon: <TbTarget size="1.4rem" /> },
    ],
  },
};

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK', 'DKK'];

function RadioCardGroup({ config, currentValue, onChange }) {
  return (
    <Radio.Group value={currentValue} onChange={onChange}>
      <Stack gap="xs">
        <Text fw={500} size="sm">{config.label}</Text>
        <SimpleGrid cols={{ base: 1, sm: config.options.length }}>
          {config.options.map((opt) => (
            <Radio.Card
              className="admin-radio-card"
              key={opt.value}
              value={opt.value}
            >
              <Group wrap="nowrap" align="flex-start" p="md" gap="sm">
                <Radio.Indicator />
                <div>
                  <Group gap="xs" mb={4}>
                    {opt.icon}
                    <Text fw={600} size="sm">{opt.label}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">{opt.description}</Text>
                </div>
              </Group>
            </Radio.Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Radio.Group>
  );
}

function Field({ label, value, onChange, type }) {
  if (typeof value === 'boolean') return <Switch label={label} checked={value} onChange={(e) => onChange(e.currentTarget.checked)} />;
  if (typeof value === 'number') return <NumberInput label={label} value={value} onChange={(v) => onChange(typeof v === 'number' ? v : 0)} />;
  if (typeof value === 'string') {
    const isHex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value || '');
    const lower = (label || '').toLowerCase();
    if (type === 'color' || isHex || lower.includes('color')) {
      return <ColorInput format="hex" label={label} value={value || ''} onChange={(v) => onChange(v)} />;
    }
  }
  return <TextInput label={label} value={String(value ?? '')} onChange={(e) => onChange(e.currentTarget.value)} />;
}

export default function SectionEditor({ path, form, value, excludeKeys = [] }) {
  const keys = useMemo(() => Object.keys(value || {}).filter(k => !excludeKeys.includes(k)), [value, excludeKeys]);
  const [tebexCategories, setTebexCategories] = useState([]);
  const [tebexCategoriesGrouped, setTebexCategoriesGrouped] = useState([]);
  const [tebexPackages, setTebexPackages] = useState([]);
  const [tebexPackagesGrouped, setTebexPackagesGrouped] = useState([]);
  const [internalBlogPosts, setInternalBlogPosts] = useState([]);
  const [gamemodeCategories, setGamemodeCategories] = useState([]);
  const joinedPath = useMemo(() => path.join('.'), [path]);
  const defaultGamemodeColour = useMemo(() => String(form.values?.theme?.settings?.colors?.primary_color || '#0FF0EB'), [form.values?.theme?.settings?.colors?.primary_color]);
  const categoryLabelMap = useMemo(() => new Map((Array.isArray(tebexCategories) ? tebexCategories : []).map((o) => [o.value, o.label])), [tebexCategories]);
  const packageLabelMap = useMemo(() => new Map((Array.isArray(tebexPackages) ? tebexPackages : []).map((o) => [o.value, o.label])), [tebexPackages]);
  const CategoryValue = ({ value, label, onRemove, className }) => (
    <Box className={className} px={8} py={2} bd="1px solid var(--mantine-color-background-5)" bg="background_alt">
      <Group gap={6} wrap="nowrap">
        <Text>{categoryLabelMap.get(String(value)) || String(label || value)}</Text>
        <CloseButton onMouseDown={onRemove} aria-label="Remove item" size="xs" variant="subtle" />
      </Group>
    </Box>
  );
  const PackageValue = ({ value, label, onRemove, className }) => (
    <Box className={className} px={8} py={2} bd="1px solid var(--mantine-color-background-5)" bg="background_alt">
      <Group gap={6} wrap="nowrap">
        <Text>{packageLabelMap.get(String(value)) || String(label || value)}</Text>
        <CloseButton onMouseDown={onRemove} aria-label="Remove item" size="xs" variant="subtle" />
      </Group>
    </Box>
  );

  const needsCategories = joinedPath.includes('categories') || joinedPath.includes('top_categories') || joinedPath.includes('featured_categories') || joinedPath === 'store.settings';

  useEffect(() => {
    if (joinedPath !== 'gamemodes.settings.gamemodes_list') return;
    let active = true;
    fetch('/api/admin/categories', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!active) return;
        const cats = Array.isArray(data) ? data : [];
        setGamemodeCategories(cats.map(c => ({ value: String(c.id), label: c.name })));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [joinedPath]);

  useEffect(() => {
    let active = true;
    if (needsCategories) {
      (async () => {
        try {
          let cats = [];
          try {
            const res = await fetch('/api/admin/categories', { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              cats = Array.isArray(data) ? data : [];
            }
          } catch {}
          if (!cats.length) {
            const data = await getCategories();
            cats = Array.isArray(data) ? data : [];
          }
          if (!active) return;
          const nodes = new Map();
          cats.forEach((c) => {
            const id = String(c?.id ?? '');
            const name = String(c?.name ?? id);
            if (!id) return;
            let parentId;
            const p = c?.parent;
            if (typeof p === 'string' || typeof p === 'number') parentId = String(p);
            else if (p && typeof p === 'object') parentId = String(p?.id ?? '');
            else if (typeof c?.parent_id !== 'undefined') parentId = String(c.parent_id);
            nodes.set(id, { id, name, parentId: parentId || '' });
          });
          const children = new Map();
          Array.from(nodes.values()).forEach((n) => {
            const list = children.get(n.parentId) || [];
            list.push(n.id);
            children.set(n.parentId, list);
          });
          const buildPath = (id, limit = 20) => {
            const pathNames = [];
            let current = nodes.get(id);
            let safety = 0;
            while (current && safety < limit) {
              pathNames.push(current.name);
              const pid = current.parentId;
              if (!pid) break;
              current = nodes.get(pid);
              safety += 1;
            }
            return pathNames.reverse();
          };
          const flat = Array.from(nodes.values()).map((n) => ({ value: n.id, label: n.name }));
          const grouped = [];
          Array.from(children.entries()).forEach(([pid, ids]) => {
            const items = ids.map((cid) => {
              const n = nodes.get(cid);
              return n ? { value: n.id, label: n.name } : null;
            }).filter(Boolean);
            if (items.length === 0) return;
            let groupLabel = 'Top level';
            if (pid && nodes.get(pid)) groupLabel = buildPath(pid).join(' / ');
            grouped.push({ group: groupLabel, items });
          });
          setTebexCategories(flat.filter((o) => o.value && o.label));
          setTebexCategoriesGrouped(grouped);
        } catch (_) {
          setTebexCategories([]);
          setTebexCategoriesGrouped([]);
        }
      })();
    }
    return () => {
      active = false;
    };
  }, [joinedPath, needsCategories]);

  useEffect(() => {
    let active = true;
    if (joinedPath.includes('package_ids') || joinedPath.includes('featured_package_ids') || joinedPath.includes('rank_package_ids')) {
      (async () => {
        try {
          let cats = [];
          try {
            const res = await fetch('/api/admin/categories', { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              cats = Array.isArray(data) ? data : [];
            }
          } catch {}
          if (!cats.length) {
            const data = await getCategories();
            cats = Array.isArray(data) ? data : [];
          }
          if (!active) return;
          const pkgMap = new Map();
          const seen = new Set();
          const grouped = [];
          (Array.isArray(cats) ? cats : []).forEach((c) => {
            const categoryName = String(c?.name ?? 'Other');
            const rawPkgs = c?.packages;
            let pkgs = [];
            if (Array.isArray(rawPkgs)) {
              pkgs = rawPkgs;
            } else if (rawPkgs && Array.isArray(rawPkgs.data)) {
              pkgs = rawPkgs.data;
            } else if (rawPkgs && typeof rawPkgs === 'object') {
              pkgs = Object.values(rawPkgs).filter((item) => item && typeof item === 'object');
            }
            const items = [];
            pkgs.forEach((p) => {
              const id = String(p?.id ?? p?.package?.id ?? '');
              const name = String(p?.name ?? p?.title ?? p?.display_name ?? p?.package?.name ?? '');
              if (!id) return;
              if (!pkgMap.has(id)) pkgMap.set(id, { value: id, label: name || id });
              if (!seen.has(id)) {
                seen.add(id);
                items.push({ value: id, label: name || id });
              }
            });
            if (items.length > 0) grouped.push({ group: categoryName, items });
          });
          const currentSelected = Array.isArray(value) ? value.map((v) => String(v)) : [];
          const idsNeedingNames = currentSelected.filter((id) => id && (!pkgMap.has(id) || pkgMap.get(id)?.label === id));
          if (idsNeedingNames.length > 0) {
            const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
            if (token) {
              const fetched = await Promise.all(idsNeedingNames.map(async (id) => {
                try {
                  const res = await fetch(`https://headless.tebex.io/api/accounts/${token}/packages/${id}`);
                  if (!res.ok) return { id, name: id };
                  const data = await res.json();
                  const packageName = String(data?.data?.name ?? data?.name ?? id);
                  return { id, name: packageName };
                } catch {
                  return { id, name: id };
                }
              }));
              fetched.forEach(({ id, name }) => {
                pkgMap.set(id, { value: id, label: name || id });
              });
            } else {
              idsNeedingNames.forEach((id) => {
                if (!pkgMap.has(id)) pkgMap.set(id, { value: id, label: id });
              });
            }
          }
          setTebexPackages(Array.from(pkgMap.values()));
          setTebexPackagesGrouped(grouped);
        } catch (_) {
          setTebexPackages([]);
          setTebexPackagesGrouped([]);
        }
      })();
    }
    return () => {
      active = false;
    };
  }, [joinedPath]);

  useEffect(() => {
    if (joinedPath !== 'blog.settings') return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/blogs', { cache: 'no-store' });
        if (!res.ok || !active) return;
        const data = await res.json();
        if (active) setInternalBlogPosts(Array.isArray(data) ? data : []);
      } catch {
        if (active) setInternalBlogPosts([]);
      }
    })();
    return () => { active = false; };
  }, [joinedPath]);

  const setAt = (subKey, nextVal) => {
    const full = [...path, subKey];
    form.setFieldValue(full.join('.'), nextVal);
  };

  const getFieldType = (fieldPath, fieldValue) => {
    const arr = Array.isArray(fieldPath) ? fieldPath : String(fieldPath || '').split('.');
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    const jp = arr.join('.');
    if (
      jp.includes('color') || jp.includes('primary') || jp.includes('secondary') || jp.includes('background') || jp.includes('text_color') || jp.includes('title_color')
    ) return 'color';
    return undefined;
  };

  if (Array.isArray(value)) {
    if (joinedPath.includes('categories') || joinedPath === 'store.settings.top_categories' || joinedPath === 'store.settings.featured_categories') {
      return (
        <Stack>
          <MultiSelect
            label={formatLabel(path[path.length - 1])}
            data={tebexCategoriesGrouped.length ? tebexCategoriesGrouped : tebexCategories}
            valueComponent={CategoryValue}
            value={(Array.isArray(value) ? value : []).map((v) => String(v))}
            onChange={(v) => form.setFieldValue(path.join('.'), v)}
          />
        </Stack>
      );
    }
    if (joinedPath.includes('package_ids') || joinedPath === 'store.settings.featured_package_ids' || joinedPath === 'store.settings.rank_package_ids') {
      return (
        <Stack>
          <MultiSelect
            label={formatLabel(path[path.length - 1])}
            data={tebexPackagesGrouped.length ? tebexPackagesGrouped : tebexPackages}
            valueComponent={PackageValue}
            searchable
            nothingFoundMessage="No packages found"
            value={(Array.isArray(value) ? value : []).map((v) => String(v))}
            onChange={(v) => form.setFieldValue(path.join('.'), v)}
          />
        </Stack>
      );
    }
    if (joinedPath === 'translation.settings.languages') {
      return (
        <Stack w="100%" gap="md">
          <Paper p="md" withBorder>
            <Text fw={600}>Language entries</Text>
            <Text size="sm" c="dimmed">Each language needs a display name, locale key and flag image path.</Text>
          </Paper>
          {value.map((item, idx) => (
            <Card key={idx} p="md" withBorder pos="relative">
              <ActionIcon 
                size="lg" 
                pos="absolute" 
                top={12}
                right={12}
                zIndex={10}
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
              <Text fw={600} mb="sm">Language #{idx + 1}</Text>
              {isObject(item) ? (
                <Stack gap="sm">
                  <TextInput
                    label="Language Name"
                    placeholder="English"
                    value={item.value || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], value: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <TextInput
                    label="Language Code"
                    placeholder="en"
                    value={item.key || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], key: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <TextInput
                    label="Flag Image Path"
                    placeholder="/language_icons/en.png"
                    value={item.flag || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], flag: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                </Stack>
              ) : (
                <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} />
              )}
            </Card>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            const template = { flag: '', value: '', key: '' };
            const next = [...value, template];
            form.setFieldValue(path.join('.'), next);
          }}>Add Language</Button>
        </Stack>
      );
    }
    if (joinedPath === 'rules.settings.rules' || joinedPath === 'rules.settings.discord_rules') {
      const isServerRules = joinedPath === 'rules.settings.rules';
      return (
        <Stack w="100%" gap="md">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm" c="dimmed">{isServerRules ? 'Server Rules' : 'Discord Rules'}</Text>
            <Button 
              size="sm" 
              leftSection={<TbPlus />} 
              onClick={() => {
                const template = { label: '', description: '' };
                const next = [...value, template];
                form.setFieldValue(path.join('.'), next);
              }}
            >
              Add Rule
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {value.map((item, idx) => (
              <Card key={idx} p="md" withBorder radius="md" pos="relative">
                <ActionIcon 
                  size="sm" 
                  pos="absolute" 
                  top={8} 
                  right={8} 
                  style={{boxShadow: 'none'}}
                  color="var(--app-neutral-white)"
                  bg="red"
                  onClick={() => {
                    const next = value.filter((_, i) => i !== idx);
                    form.setFieldValue(path.join('.'), next);
                  }}
                >
                  <TbX />
                </ActionIcon>
                <Stack gap="sm">
                  <Group gap="xs" align="center">
                    <Text fw={600} size="sm" c="dimmed">#{idx + 1}</Text>
                    <Text fw={600} size="sm">Rule {idx + 1}</Text>
                  </Group>
                  <TextInput
                    label="Label Key"
                    placeholder="e.g. noCheating"
                    description="This key maps to Rules.{key} in translations"
                    value={item.label || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], label: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <TextInput
                    label="Description Key"
                    placeholder="e.g. noCheatingDesc"
                    description="This key maps to Rules.{key} in translations"
                    value={item.description || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], description: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <Group gap="xs" mt="xs">
                    <ActionIcon 
                      component={Link} 
                      href={`/admin?tab=translation&transTab=translations&filter=${encodeURIComponent(item.label ? `Rules.${item.label}` : 'Rules.')}`} 
                      variant="light" 
                      size="sm"
                      style={{boxShadow: 'none'}}
                      aria-label="Edit in translations"
                    >
                      <TbPencil />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">Edit translations</Text>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          {value.length === 0 && (
            <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text c="dimmed" mb="md">No {isServerRules ? 'server' : 'Discord'} rules added yet</Text>
              <Button 
                leftSection={<TbPlus />} 
                onClick={() => {
                  const template = { label: '', description: '' };
                  form.setFieldValue(path.join('.'), [template]);
                }}
              >
                Add First Rule
              </Button>
            </Paper>
          )}
        </Stack>
      );
    }
    if (joinedPath === 'vote.settings.links') {
      return (
        <Stack w="100%" gap="md">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm" c="dimmed">Voting Links</Text>
            <Button 
              size="sm" 
              leftSection={<TbPlus />} 
              onClick={() => {
                const template = { name: '', url: '' };
                const next = [...value, template];
                form.setFieldValue(path.join('.'), next);
              }}
            >
              Add Link
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {value.map((item, idx) => (
              <Card key={idx} p="md" withBorder radius="md" pos="relative">
                <ActionIcon 
                  size="sm" 
                  pos="absolute" 
                  top={8} 
                  right={8} 
                  style={{boxShadow: 'none'}}
                  color="var(--app-neutral-white)"
                  bg="red"
                  onClick={() => {
                    const next = value.filter((_, i) => i !== idx);
                    form.setFieldValue(path.join('.'), next);
                  }}
                >
                  <TbX />
                </ActionIcon>
                <Stack gap="sm">
                  <TextInput
                    label="Site Name"
                    placeholder="e.g. MC Server List"
                    value={item.name || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], name: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <TextInput
                    label="Vote URL"
                    placeholder="https://example.com/vote/your-server"
                    value={item.url || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], url: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          {value.length === 0 && (
            <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text c="dimmed" mb="md">No voting links added yet</Text>
              <Button 
                leftSection={<TbPlus />} 
                onClick={() => {
                  const template = { name: '', url: '' };
                  form.setFieldValue(path.join('.'), [template]);
                }}
              >
                Add First Link
              </Button>
            </Paper>
          )}
        </Stack>
      );
    }
    if (joinedPath === 'gamemodes.settings.gamemodes_list') {
      return (
        <Stack w="100%" gap="md">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm" c="dimmed">Gamemodes</Text>
            <Button
              size="sm"
              leftSection={<TbPlus />}
              onClick={() => {
                const next = [
                  ...value,
                  {
                    id: `gm_${Date.now()}`,
                    name: '',
                    colour: defaultGamemodeColour,
                    category_id: '',
                  }
                ];
                form.setFieldValue(path.join('.'), next);
              }}
            >
              Add Gamemode
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            {value.map((item, idx) => (
              <Card key={item.id || idx} p="md" withBorder pos="relative">
                <ActionIcon
                  size="sm"
                  pos="absolute"
                  top={8}
                  right={8}
                  color="var(--app-neutral-white)"
                  bg="red"
                  style={{ boxShadow: 'none' }}
                  onClick={() => {
                    const next = value.filter((_, i) => i !== idx);
                    form.setFieldValue(path.join('.'), next);
                  }}
                >
                  <TbX />
                </ActionIcon>
                <Stack gap="sm">
                  <Group grow align="flex-start">
                    <TextInput
                      label="Gamemode Name"
                      placeholder="e.g. Factions"
                      value={item.name || ''}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], name: e.currentTarget.value };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                    <ColorInput
                      format="hex"
                      label="Colour"
                      value={item.colour || defaultGamemodeColour}
                      onChange={(v) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], colour: v };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                  </Group>
                  <Select
                    label="Tebex Category"
                    placeholder="Select a category"
                    data={gamemodeCategories}
                    value={item.category_id ? String(item.category_id) : null}
                    onChange={(v) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], category_id: v || '' };
                      form.setFieldValue(path.join('.'), next);
                    }}
                    searchable
                    clearable
                  />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          {value.length === 0 && (
            <Paper p="xl" withBorder>
              <Text c="dimmed" ta="center">No gamemodes configured yet. Add your first gamemode.</Text>
            </Paper>
          )}
        </Stack>
      );
    }
    if (joinedPath === 'extra_pages.settings.pages') {
      return (
        <Stack w="100%" gap="md">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm" c="dimmed">Extra Pages</Text>
            <Button
              size="sm"
              leftSection={<TbPlus />}
              onClick={() => {
                const next = [
                  ...value,
                  {
                    id: `page_${Date.now()}`,
                    label: '',
                    link: '',
                    icon: 'fa-solid fa-star',
                    content_type: 'markdown',
                    content: '',
                  }
                ];
                form.setFieldValue(path.join('.'), next);
              }}
            >
              Add Page
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            {value.map((item, idx) => (
              <Card key={item.id || idx} p="md" withBorder pos="relative">
                <ActionIcon
                  size="sm"
                  pos="absolute"
                  top={8}
                  right={8}
                  color="var(--app-neutral-white)"
                  bg="red"
                  onClick={() => {
                    const next = value.filter((_, i) => i !== idx);
                    form.setFieldValue(path.join('.'), next);
                  }}
                >
                  <TbX />
                </ActionIcon>
                <Stack gap="sm">
                  <Group grow align="flex-start">
                    <TextInput
                      label="Label"
                      placeholder="Guides"
                      value={item.label || ''}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], label: e.currentTarget.value };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                    <TextInput
                      label="Link"
                      placeholder="/guides"
                      value={item.link || ''}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], link: e.currentTarget.value };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                  </Group>
                  <Group grow align="flex-start">
                    <TextInput
                      label="Font Awesome Icon Class"
                      placeholder="fa-solid fa-star"
                      value={item.icon || ''}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], icon: e.currentTarget.value };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                    <Select
                      label="Content Type"
                      data={[
                        { value: 'markdown', label: 'Markdown' },
                        { value: 'html', label: 'HTML' },
                      ]}
                      value={item.content_type || 'markdown'}
                      onChange={(v) => {
                        const next = [...value];
                        next[idx] = { ...next[idx], content_type: v || 'markdown' };
                        form.setFieldValue(path.join('.'), next);
                      }}
                    />
                  </Group>
                  <Textarea
                    label="Page Content"
                    minRows={12}
                    autosize
                    value={item.content || ''}
                    onChange={(e) => {
                      const next = [...value];
                      next[idx] = { ...next[idx], content: e.currentTarget.value };
                      form.setFieldValue(path.join('.'), next);
                    }}
                  />
                  <input
                    type="file"
                    accept=".md,.markdown,.html,.htm,text/markdown,text/html"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const next = [...value];
                        const text = String(reader.result || '');
                        const isMarkdown = /\.md|\.markdown$/i.test(file.name);
                        next[idx] = {
                          ...next[idx],
                          content: text,
                          content_type: isMarkdown ? 'markdown' : 'html',
                        };
                        form.setFieldValue(path.join('.'), next);
                      };
                      reader.readAsText(file);
                    }}
                  />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          {value.length === 0 && (
            <Paper p="xl" withBorder>
              <Text c="dimmed" ta="center">No extra pages yet. Add your first page.</Text>
            </Paper>
          )}
        </Stack>
      );
    }
    return (
      <Stack w="100%">
        {value.map((item, idx) => (
          <Box w="100%" pos="relative" bg="background_alt" key={idx} p="sm" bd="1px solid var(--mantine-color-background-5)">
            <ActionIcon 
              size="lg" 
              pos="absolute" 
              top="1rem" 
              right="1rem" 
              zIndex={10}
              onClick={() => {
                const next = value.filter((_, i) => i !== idx);
                form.setFieldValue(path.join('.'), next);
              }}
            >
              <TbX />
            </ActionIcon>
            {isObject(item) ? (
              <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
            ) : (
              <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                const next = [...value];
                next[idx] = v;
                form.setFieldValue(path.join('.'), next);
              }} />
            )}
          </Box>
        ))}
        <Button leftSection={<TbPlus />} onClick={() => {
          let template;
          if (value && value.length > 0 && isObject(value[0])) {
            const sampleObj = value[0] || {};
            const keys = Object.keys(sampleObj);
            template = keys.reduce((acc, k) => {
              const sample = sampleObj[k];
              if (Array.isArray(sample)) {
                acc[k] = sample.length > 0 ? (typeof sample[0] === 'string' ? [''] : typeof sample[0] === 'number' ? [0] : typeof sample[0] === 'boolean' ? [false] : isObject(sample[0]) ? [{}] : []) : [''];
              } else if (typeof sample === 'boolean') {
                acc[k] = false;
              } else if (typeof sample === 'number') {
                acc[k] = 0;
              } else if (isObject(sample)) {
                acc[k] = {};
              } else {
                acc[k] = '';
              }
              return acc;
            }, {});
          } else {
            template = '';
          }
          const next = [...value, template];
          form.setFieldValue(path.join('.'), next);
        }}>Add</Button>
      </Stack>
    );
  }

  if (isObject(value)) {
    const joined = path.join('.');
    if (joinedPath === 'theme.settings.colors') {
      const colorGroups = [
        {
          title: 'Brand',
          description: 'Primary accent colours used across buttons and highlights.',
          fields: [
            { key: 'primary_color', label: 'Primary Colour' },
            { key: 'primary_contrast_color', label: 'Primary Contrast Colour' },
            { key: 'neutral_black', label: 'Neutral Black' },
            { key: 'neutral_white', label: 'Neutral White' },
            { key: 'neutral_gray_333', label: 'Neutral Gray 333' },
            { key: 'notification_error_color', label: 'Error Background' },
            { key: 'notification_error_shadow_color', label: 'Error Shadow' },
          ],
        },
        {
          title: 'Light Mode',
          description: 'Main site colours used in light mode.',
          fields: [
            { key: 'light_background_color', label: 'Light Background' },
            { key: 'light_surface_color', label: 'Light Surface' },
            { key: 'light_surface_border_color', label: 'Light Surface Border' },
            { key: 'light_shadow_color', label: 'Light Shadow' },
            { key: 'light_input_color', label: 'Light Input' },
            { key: 'overlay_light_60_color', label: 'Overlay Light 60' },
            { key: 'overlay_light_border_color', label: 'Overlay Light Border' },
            { key: 'hero_overlay_light_start_color', label: 'Hero Overlay Light Start' },
            { key: 'hero_overlay_light_end_color', label: 'Hero Overlay Light End' },
            { key: 'page_overlay_light_start_color', label: 'Page Overlay Light Start' },
            { key: 'admin_radio_checked_light_color', label: 'Admin Checked Light' },
            { key: 'gamemode_trigger_light_color', label: 'Gamemode Trigger Light' },
            { key: 'gamemode_trigger_hover_light_color', label: 'Gamemode Trigger Hover Light' },
            { key: 'gamemode_dropdown_light_color', label: 'Gamemode Dropdown Light' },
            { key: 'gamemode_dropdown_border_light_color', label: 'Gamemode Dropdown Border Light' },
            { key: 'gamemode_option_hover_light_color', label: 'Gamemode Option Hover Light' },
            { key: 'gamemode_option_active_light_color', label: 'Gamemode Option Active Light' },
          ],
        },
        {
          title: 'Dark Mode',
          description: 'Main site colours used in dark mode.',
          fields: [
            { key: 'dark_background_color', label: 'Dark Background' },
            { key: 'dark_surface_color', label: 'Dark Surface' },
            { key: 'dark_surface_border_color', label: 'Dark Surface Border' },
            { key: 'dark_shadow_color', label: 'Dark Shadow' },
            { key: 'dark_input_color', label: 'Dark Input' },
            { key: 'snow_color', label: 'Snow Colour' },
            { key: 'overlay_dark_60_color', label: 'Overlay Dark 60' },
            { key: 'overlay_dark_border_color', label: 'Overlay Dark Border' },
            { key: 'hero_overlay_dark_start_color', label: 'Hero Overlay Dark Start' },
            { key: 'hero_overlay_dark_end_color', label: 'Hero Overlay Dark End' },
            { key: 'page_overlay_dark_start_color', label: 'Page Overlay Dark Start' },
            { key: 'admin_radio_checked_dark_color', label: 'Admin Checked Dark' },
            { key: 'notification_close_hover_color', label: 'Notification Close Hover' },
            { key: 'admin_sidebar_hover_color', label: 'Admin Sidebar Hover' },
            { key: 'admin_sidebar_active_color', label: 'Admin Sidebar Active' },
            { key: 'gamemode_trigger_dark_color', label: 'Gamemode Trigger Dark' },
            { key: 'gamemode_trigger_hover_dark_color', label: 'Gamemode Trigger Hover Dark' },
            { key: 'gamemode_dropdown_dark_color', label: 'Gamemode Dropdown Dark' },
            { key: 'gamemode_dropdown_border_dark_color', label: 'Gamemode Dropdown Border Dark' },
            { key: 'gamemode_dropdown_shadow_color', label: 'Gamemode Dropdown Shadow' },
            { key: 'gamemode_option_hover_dark_color', label: 'Gamemode Option Hover Dark' },
            { key: 'gamemode_option_active_dark_color', label: 'Gamemode Option Active Dark' },
          ],
        },
      ];
      return (
        <Stack gap="md">
          <Paper withBorder p="md">
            <Text fw={600}>Theme Colours</Text>
            <Text size="sm" c="dimmed">Colours are grouped below to make light and dark mode edits easier.</Text>
          </Paper>
          {colorGroups.map((group) => (
            <Paper key={group.title} withBorder p="md">
              <Stack gap="sm">
                <div>
                  <Text fw={600}>{group.title}</Text>
                  <Text size="sm" c="dimmed">{group.description}</Text>
                </div>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {group.fields.map((field) => (
                    <ColorInput
                      key={field.key}
                      format="hex"
                      label={field.label}
                      value={String(value[field.key] ?? '')}
                      onChange={(next) => setAt(field.key, next)}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>
          ))}
        </Stack>
      );
    }
    return (
      <Stack>
        {keys.map((k, idx) => (
          <React.Fragment key={k}>
            <Box>
              {k === 'description' ? (
                <Text c="dimmed">{String(value[k] ?? '')}</Text>
              ) : isObject(value[k]) || Array.isArray(value[k]) ? (
                <>
                  <Title order={5} mb="xs">{formatLabel(k)}</Title>
                  <SectionEditor path={[...path, k]} form={form} value={value[k]} />
                </>
              ) : (
                <>
                  {VARIANT_FIELDS[`${joinedPath}.${k}`] ? (
                    <RadioCardGroup
                      config={VARIANT_FIELDS[`${joinedPath}.${k}`]}
                      currentValue={String(value[k] ?? VARIANT_FIELDS[`${joinedPath}.${k}`].defaultValue)}
                      onChange={(v) => setAt(k, v || VARIANT_FIELDS[`${joinedPath}.${k}`].defaultValue)}
                    />
                  ) : joinedPath === 'blog.settings' && k === 'home_page_featured_post' ? (
                    <Select
                      label={formatLabel(k)}
                      data={[
                        { value: 'newest', label: 'Newest Post' },
                        ...internalBlogPosts.map((p) => ({
                          value: p.id || p.slug,
                          label: p.title || p.id || p.slug
                        }))
                      ]}
                      value={String(value[k] ?? 'newest')}
                      onChange={(v) => setAt(k, v || 'newest')}
                    />
                  ) : joinedPath === 'gamemodes.settings' && k === 'default_gamemode' ? (
                    <Select
                      label={formatLabel(k)}
                      placeholder="Select default gamemode"
                      data={(Array.isArray(form.values?.gamemodes?.settings?.gamemodes_list) ? form.values.gamemodes.settings.gamemodes_list : []).map((gm) => ({
                        value: gm.id,
                        label: gm.name || gm.id,
                      }))}
                      value={String(value[k] ?? '')}
                      onChange={(v) => setAt(k, v || '')}
                      clearable
                    />
                  ) : joinedPath === 'translation.settings' && k === 'default_language' ? (
                    <Select
                      label={formatLabel(k)}
                      data={(Array.isArray(form.values?.translation?.settings?.languages) ? form.values.translation.settings.languages : []).map((lang) => ({
                        value: lang.key,
                        label: lang.value || lang.key
                      }))}
                      value={String(value[k] ?? 'en')}
                      onChange={(v) => setAt(k, v || 'en')}
                    />
                  ) : joinedPath === 'store.settings' && k === 'gift_card_category_id' ? (
                    <Select
                      label={formatLabel(k)}
                      placeholder="Select category"
                      data={tebexCategoriesGrouped.length ? tebexCategoriesGrouped : tebexCategories}
                      value={String(value[k] ?? '')}
                      onChange={(v) => setAt(k, v || '')}
                      searchable
                      clearable
                    />
                  ) : joinedPath === 'store.settings' && k === 'fixed_currency' ? (
                    <Select
                      label={formatLabel(k)}
                      placeholder="Select currency"
                      data={SUPPORTED_CURRENCIES}
                      value={String(value[k] ?? 'USD').toUpperCase()}
                      onChange={(v) => setAt(k, String(v || 'USD').toUpperCase())}
                      searchable
                    />
                  ) : (
                    <Field label={formatLabel(k)} value={value[k]} type={getFieldType([...path, k], value[k])} onChange={(v) => setAt(k, v)} />
                  )}
                  {(() => {
                    const isRule = /^(rules\.settings\.(rules|discord_rules)\.[0-9]+)$/.test(joined);
                    const isTranslatable = isRule && (k === 'label' || k === 'description');
                    if (!isTranslatable) return null;
                    const base = String(value[k] ?? '');
                    const target = base ? `Rules.${base}` : '';
                    const href = target ? `/admin?tab=translation&transTab=translations&filter=${encodeURIComponent(target)}` : '/admin?tab=translation&transTab=translations';
                    return (
                      <Group mt={6}>
                        <ActionIcon component={Link} href={href} variant="light" size="sm" aria-label="Edit in translations">
                          <TbPencil />
                        </ActionIcon>
                        <Text c="dimmed" fz="sm">Add the actual text in Translations: {target || 'Rules.*'}</Text>
                      </Group>
                    );
                  })()}
                </>
              )}
            </Box>
            {idx < keys.length - 1 && <Divider my="md" />}
          </React.Fragment>
        ))}
      </Stack>
    );
  }

  return <TextInput label={formatLabel(path[path.length - 1])} value={String(value ?? '')} onChange={(e) => form.setFieldValue(path.join('.'), e.currentTarget.value)} />;
}

