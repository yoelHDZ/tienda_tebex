'use client'

import { ActionIcon, Box, Button, Card, Divider, Grid, GridCol, Group, Loader, NavLink, SegmentedControl, Stack, Text, Title, darken } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TbArrowRight, TbBasket, TbBrandX, TbDeviceGamepad2, TbLanguage, TbNews, TbNote, TbPalette, TbPencil, TbPlus, TbServer, TbSettings, TbTag, TbTarget, TbTrash } from 'react-icons/tb';
import BlogCard from '../BlogCard';
import SectionEditor from './SectionEditor';
import TranslationsEditor from './TranslationsEditor';

export default function AdminPanel() {
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [transTab, setTransTab] = useState('translations');
  const [blogPosts, setBlogPosts] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const loadBlogPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blogs', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(Array.isArray(data) ? data : []);
      }
    } catch { }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        setInitial(data);
        const firstKey = Object.keys(data || {})[0] || null;
        const tabParam = searchParams.get('tab');
        setActive(tabParam || firstKey);
      } catch (e) {
        notifications.show({ color: 'red', title: 'Error', message: e.message || 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    run();
    loadBlogPosts();
  }, []);

  const form = useForm({ initialValues: initial || {}, validateInputOnBlur: true });

  useEffect(() => {
    if (initial) {
      form.setValues(initial);
      if (!active) {
        const tabParam = searchParams.get('tab');
        setActive(tabParam || (Object.keys(initial || {})[0] || null));
      }
    }
  }, [initial]);

  useEffect(() => {
    if (!active) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get('tab') === active) return;
    current.set('tab', active);
    router.replace(`${pathname}?${current.toString()}`);
  }, [active]);

  const iconMap = {
    general: <TbSettings />,
    server: <TbServer />,
    blog: <TbNews />,
    sales: <TbTag />,
    store: <TbBasket />,
    social: <TbBrandX />,
    theme: <TbPalette />,
    translation: <TbLanguage />,
    community_goal: <TbTarget />,
    rules: <TbNote />,
    vote: <TbPencil />,
    extra_pages: <TbNote />,
    gamemodes: <TbDeviceGamepad2 />,
  };

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlTransTab = searchParams.get('transTab');
    if (urlTab && urlTab !== active) setActive(urlTab);
    if (urlTransTab && urlTransTab !== transTab) setTransTab(urlTransTab);
  }, [searchParams]);

  useEffect(() => {
    if (active !== 'translation') return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get('transTab') === transTab) return;
    current.set('transTab', transTab);
    router.replace(`${pathname}?${current.toString()}`);
  }, [transTab, active]);

  const sections = useMemo(() => {
    return Object.keys(form.values || {}).filter((k) => k !== 'translation').concat(['translation']);
  }, [form.values]);

  const labelFor = (k) => {
    if (!k) return '';
    const spaced = String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const save = async () => {
    if (isDemo) {
      notifications.show({
        title: 'Demo mode', message: 'Saving is disabled in demo mode',
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
      return;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save');
      }
      notifications.show({
        title: 'Saved',
        message: 'Settings updated',
        styles: {
          root: {
            backgroundColor: 'var(--mantine-color-green-5)',
          },
        }
      });
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.message || 'Failed to save',
        styles: {
          root: {
            backgroundColor: 'var(--mantine-color-red-5)',
          },
        }
      });
    }
  };

  const handleSidebarSave = () => {
    if (active === 'translation' && transTab === 'translations') {
      window.dispatchEvent(new Event('admin-save-translations'));
      return;
    }
    save();
  };

  const description = active && active !== 'translation' ? (form.values?.[active]?.description || '') : '';
  const activeSettings = active && active !== 'translation' ? (form.values?.[active]?.settings || {}) : {};

  if (loading) return <Group align="center" justify="center"><Loader /></Group>;
  if (!initial) return <Text>No settings. Check the file exists in data/settings.json</Text>;

  return (
    <Grid gutter="lg">
      <GridCol span={{ base: 12, md: 3 }}>
        <Box pos="sticky" top={16}>
          <Card mb="1rem" className="admin-sidebar" withBorder p="sm" radius={10}>
            <Stack gap={6}>
              <Stack gap={6}>
                {sections.map((key) => (
                  <NavLink
                    rightSection={<TbArrowRight />}
                    leftSection={iconMap[key]}
                    key={key}
                    label={labelFor(key)}
                    active={key === active}
                    onClick={() => setActive(key)}
                    fz="1.2rem"
                    className="admin-sidebar-item"
                  />
                ))}
              </Stack>
              <Divider my="sm" />
              <Button onClick={handleSidebarSave} size="md">
                {active === 'translation' && transTab === 'translations' ? 'Save translations' : 'Save changes'}
              </Button>
            </Stack>
          </Card>
        </Box>
      </GridCol>
      <GridCol span={{ base: 12, md: 9 }}>
        <Card withBorder p={{ base: '1rem', md: '1.25rem' }} radius={10} className="admin-content-card">
          <Group justify="space-between" align="center" mb="sm">
            <Title order={3}>{labelFor(active)}</Title>
            {active === 'translation' ? (
              <SegmentedControl w="100%" value={transTab} onChange={setTransTab} data={[{ label: 'Settings', value: 'settings' }, { label: 'Translations', value: 'translations' }]} />
            ) : null}
          </Group>
          {active === 'translation' ? (
            transTab === 'settings' ? (
              <>
                {form.values?.translation?.description && <Text c="dimmed" mb="md">{form.values.translation.description}</Text>}
                <SectionEditor path={['translation', 'settings']} form={form} value={form.values?.translation?.settings || {}} />
              </>
            ) : (
              <TranslationsEditor />
            )
          ) : active === 'blog' ? (
            <>
              {description && <Text c="dimmed" mb="md">{description}</Text>}
              <SectionEditor
                path={['blog', 'settings']}
                form={form}
                value={form.values?.blog?.settings?.blog_source === 'Internal'
                  ? Object.fromEntries(Object.entries(activeSettings).filter(([key]) => !['ghost_api_key', 'ghost_url'].includes(key)))
                  : Object.fromEntries(Object.entries(activeSettings).filter(([key]) => !['home_page_featured_post'].includes(key)))
                }
              />
              {form.values?.blog?.settings?.blog_source === 'Internal' && (
                <>
                  <Divider my="xl" />
                  <Group justify="space-between" mb="md">
                    <Title order={4}>Posts</Title>
                    <Button onClick={() => router.push('/admin/blog/create')} leftSection={<TbPlus />}>Create Post</Button>
                  </Group>
                  {blogPosts.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">No blog posts yet. Create your first one above.</Text>
                  ) : (
                    <Grid>
                      {blogPosts.map((post) => (
                        <GridCol key={post.id || post.slug} span={{ base: 12, sm: 6 }}>
                          <div style={{ position: 'relative' }}>
                            <BlogCard post={post} />
                            <Group gap="xs" pos="absolute" top={8} right={8}>
                              <ActionIcon onClick={() => {
                                router.push(`/admin/blog/edit/${post.id || post.slug}`);
                              }} size="md" variant="filled"><TbPencil /></ActionIcon>
                              <ActionIcon onClick={() => {
                                modals.openConfirmModal({
                                  title: 'Delete blog post',
                                  styles: { header: { display: 'none' } },
                                  children: <Text py="1rem">Are you sure you want to delete this blog post?</Text>,
                                  labels: { confirm: 'Delete', cancel: 'Cancel' },
                                  confirmProps: { color: 'red' },
                                  groupProps: { justify: "space-between" },
                                  onConfirm: async () => {
                                    try {
                                      const res = await fetch(`/api/admin/blogs/${post.id || post.slug}`, { method: 'DELETE' });
                                      if (!res.ok) throw new Error('Failed to delete');
                                      setBlogPosts((prev) => prev.filter(p => p.id !== post.id && p.slug !== post.slug));
                                      notifications.show({ color: 'green', title: 'Deleted', message: 'Blog post removed' });
                                    } catch {
                                      notifications.show({ color: 'red', title: 'Error', message: 'Failed to delete blog post' });
                                    }
                                  }
                                });
                              }} size="md" variant="filled" color="red"><TbTrash /></ActionIcon>
                            </Group>
                          </div>
                        </GridCol>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {description && <Text c="dimmed" mb="md">{description}</Text>}
              {active === 'rules' ? (
                <Text c="dimmed" mb="md">Enter keys for each rule label and description, then add the actual text in the Translations tab under Rules. For example, a label of noCheating will map to Rules.noCheating and a description of noCheatingDesc will map to Rules.noCheatingDesc.</Text>
              ) : null}
              <SectionEditor path={[active, 'settings']} form={form} value={activeSettings} />
            </>
          )}
        </Card>
      </GridCol>
    </Grid>
  );
}

