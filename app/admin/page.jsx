import { cookies } from "next/headers";
import { Anchor, Group, Image, Stack, Text } from "@mantine/core";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminPanel from "../../components/admin/AdminPanel";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";

export const dynamic = "force-dynamic";

export default async function Page() {
  const jar = cookies();
  const pass = jar.get("admin-pass")?.value || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  const authed = expected && pass === expected;

  return (
    <Stack>
      <Anchor mb="0.6rem" display="block" c="bright" component={Link} href="/">
        <Group gap="0.4rem">
          <TbArrowLeft />
          <Text>Salida Admin</Text>
        </Group>
      </Anchor>
      {authed ? <AdminPanel /> : <AdminLogin />}
    </Stack>
  );
}

