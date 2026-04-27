'use client'

import { useState } from 'react';
import { Box, Button, Card, Group, Paper, SegmentedControl, Stack, Text, TextInput, Textarea, Title, darken } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { marked } from 'marked';

const notificationStyles = {
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
};


export default function BlogEditor({ initialPost }) {
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [featureImage, setFeatureImage] = useState(initialPost?.feature_image || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [publishedAt, setPublishedAt] = useState(initialPost?.published_at ? new Date(initialPost.published_at) : new Date());
  const [content, setContent] = useState(initialPost?.content || '');
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState('write');

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!initialPost && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const save = async () => {
    if (isDemo) {
      notifications.show({ title: 'Demo mode', message: 'Saving is disabled in demo mode', styles: notificationStyles });
      return;
    }
    if (!title.trim()) {
      notifications.show({ title: 'Error', message: 'Title is required', styles: notificationStyles });
      return;
    }
    if (!slug.trim()) {
      notifications.show({ title: 'Error', message: 'Slug is required', styles: notificationStyles });
      return;
    }

    setSaving(true);
    const body = {
      title,
      slug,
      feature_image: featureImage,
      excerpt,
      published_at: publishedAt?.toISOString() || new Date().toISOString(),
      content,
    };

    const method = initialPost ? 'PUT' : 'POST';
    const url = initialPost ? `/api/admin/blogs/${initialPost.id || initialPost.slug}` : '/api/admin/blogs';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to save');
      router.push('/admin?tab=blog');
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e.message || 'Failed to save blog post' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card withBorder p={{ base: '1rem', md: '1.25rem' }} className="admin-content-card admin-blog-editor" >
      <Stack gap="md">
        <div>
          <Title order={3}>{initialPost ? 'Edit Blog Post' : 'Create Blog Post'}</Title>
          <Text c="dimmed" mt={4}>Write posts in Markdown and preview them before publishing.</Text>
        </div>

        <Group grow align="flex-start">
          <TextInput label="Title" value={title} onChange={(e) => handleTitleChange(e.currentTarget.value)} />
          <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} />
        </Group>
        <TextInput label="Feature Image URL" value={featureImage} onChange={(e) => setFeatureImage(e.currentTarget.value)} />
        <Group grow align="flex-start">
          <DatePickerInput label="Published At" value={publishedAt} onChange={(val) => setPublishedAt(val)} />
          <Textarea label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.currentTarget.value)} minRows={2} />
        </Group>

        <Box>
          <Group justify="space-between" mb="xs">
            <Text fw={600}>Content</Text>
            <SegmentedControl
              size="xs"
              value={editorMode}
              onChange={setEditorMode}
              data={[
                { value: 'write', label: 'Write' },
                { value: 'preview', label: 'Preview' },
              ]}
            />
          </Group>
          {editorMode === 'write' ? (
            <Textarea
              classNames={{ input: 'admin-markdown-input' }}
              placeholder="Write your post content in Markdown..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              minRows={20}
              autosize
            />
          ) : (
            <Paper withBorder p="md" className="admin-markdown-preview">
              {content.trim() ? (
                <Box
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">Nothing to preview yet</Text>
              )}
            </Paper>
          )}
        </Box>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => router.push('/admin?tab=blog')}>Cancel</Button>
          <Button loading={saving} onClick={save}>Save Post</Button>
        </Group>
      </Stack>
    </Card >
  );
}
