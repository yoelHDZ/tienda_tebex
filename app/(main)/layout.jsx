import { Anchor, Box, Container, Group, Image, Stack, Text, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import { FaDiscord, FaPlay } from "react-icons/fa";
import { TbCopy } from "react-icons/tb";
import JoinButton from "../../components/JoinButton";
import Navbar from "../../components/Navbar";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { getSettings } from "../../utils/settings";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }) {
  const settings = getSettings();
  const t = await getTranslations("Hero");
  const discordInviteCode =
    String(settings.discord_url || "")
      .match(/discord(?:app)?\.com\/invite\/([^/?#]+)|discord\.gg\/([^/?#]+)/i)
      ?.slice(1)
      .find(Boolean) || settings.discord_invite_code;

  let player = null;
  let discordCount = null;
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${settings.server_ip}`);
    const data = await res.json();
    player = data.players?.online.toLocaleString('en-GB') ?? null;
  } catch { }
  try {
    const discordRes = await fetch(`https://discord.com/api/v9/invites/${discordInviteCode}?with_counts=true`);
    const discordData = await discordRes.json();
    discordCount = discordData.profile.online_count.toLocaleString('en-GB') ?? null;
  } catch { }

  return (
    <>
      <Navbar />
      <Box className="page">
        <Container>
          <Group pt="12rem" pb="4rem" pos="relative" style={{ zIndex: 1 }} justify="space-evenly">
            <JoinButton>
              <Group visibleFrom="md" className="pointer">
                <ThemeIcon radius="50%" bg="var(--app-primary-color)" c="var(--app-neutral-black)" size="4rem">
                  <FaPlay size="1.6rem" />
                </ThemeIcon>
                <div>
                  <Text fz="1.4rem" fw={700} c="bright">{t("playNow")}</Text>
                  <Group gap="0.4rem">
                    <TbCopy size="1.2rem" />
                    <Text size="lg" c="bright">{player !== null ? player : "..."} {t("online")}</Text>
                  </Group>
                </div>
              </Group>
            </JoinButton>
            <Link href="/">
              <Image src={settings.hero_image_url} alt={settings.server_name} maw={{ base: 200, md: 250 }} className="main-logo" />
            </Link>
            <Anchor td="none " href={settings.discord_url} target="_blank">
              <Group visibleFrom="md">
                <div>
                  <Text ta="right" fz="1.4rem" fw={700} c="bright">{t("discord")}</Text>
                  <Text size="lg" c="bright">{discordCount !== null ? `${discordCount} ${t("online")}` : "..."}</Text>
                </div>
                <ThemeIcon radius="50%" bg="var(--app-primary-color)" c="var(--app-neutral-black)" size="4rem">
                  <FaDiscord size="1.6rem" />
                </ThemeIcon>
              </Group>
            </Anchor>
          </Group>
        </Container>
        {children}
      </Box>
      <Box p="0.4rem 1rem" mt="2rem" className="footer">
        <Container>
          <Group justify="space-between">
            <Group>
              <Link href="https://tebex.io" target="_blank">
                <Image className="invert-icon" src="/tebex_logo.png" alt="Tebex Logo" h={40} />
              </Link>
              <Stack gap={0} justify="space-between">
                <Text>© {new Date().getFullYear()} {settings.server_name}. All rights reserved.</Text>
                <Text size="sm" c="bright">El proceso de pago de este sitio web es propiedad de Tebex Limited y está gestionado por dicha empresa, que se encarga del envío de los productos, la asistencia en materia de facturación y los reembolsos.</Text>
              </Stack>
            </Group>
            <div>
              <Group>
                <Anchor c="bright" size="sm" href="https://checkout.tebex.io/impressum" target="_blank">Impressum</Anchor>
                <Anchor c="bright" size="sm" href="https://checkout.tebex.io/terms" target="_blank">Terminos de servicio</Anchor>
                <Anchor c="bright" size="sm" href="https://checkout.tebex.io/privacy" target="_blank">Politica de privacidad</Anchor>
                <ThemeSwitcher />
              </Group>
            </div>
          </Group>
        </Container>
      </Box>
    </>
  );
}

