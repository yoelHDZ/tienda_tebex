'use client'

import { Modal, Paper, Stack, Text, Title } from "@mantine/core";

export default function TebexTokenRequiredPopup() {
  return (
    <Modal
    styles={{header: {backgroundColor: 'transparent'}}}
      opened={true}
      onClose={() => {}}
      withCloseButton={false}
      centered
      size="50rem"
    >
        <Stack gap="md" align="center" ta="center">
          <Title order={2} fw={800}>
            Missing Tebex API token
          </Title>
          <Text fw={600}>
            Set Tebex API keys before using the site.
          </Text>
          <Text c="dimmed" fz="sm" maw={520}>
            Open <code>.env.example</code> or <code>.env</code>, follow the setup instructions, and add your Tebex API keys, then restart the server.
          </Text>
        </Stack>
    </Modal>
  );
}
