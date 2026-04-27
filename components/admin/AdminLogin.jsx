'use client'

import { Button, Card, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: { password: process.env.NEXT_PUBLIC_IS_DEMO ? "demo" : "" },
    validate: {
      password: (value) => (!value ? 'Password required' : null)
    }
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password })
      });
      if (!res.ok) throw new Error('Invalid password');
      router.refresh();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: e.message || 'Failed to login'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder p="xl" radius={10}>
      <Stack>
        <Title order={2}>Admin Login</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Password"
              type="password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading}>Login</Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}

