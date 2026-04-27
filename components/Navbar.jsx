"use client";

import {
    ActionIcon,
    Anchor,
    Box,
    Burger,
    Button,
    Container,
    Drawer,
    Group,
    Image,
    NumberFormatter,
    ScrollArea,
    Stack,
    Text,
    rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TbArticle, TbBasket, TbBook2, TbCopy, TbHome, TbNote, TbPencil, TbSchool, TbShoppingCart, TbTrophy, TbUserFilled } from 'react-icons/tb';
import { useBasket } from '../contexts/BasketContext';
import { useUser } from '../contexts/UserContext';
import { useSettings } from '../contexts/SettingsContext';
import Basket from './Basket';
import JoinButton from './JoinButton';
import LoginForm from './LoginForm';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function Navbar() {
    const t = useTranslations('Navbar');
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { basket } = useBasket();
    const { user, loading } = useUser();
    const settings = useSettings();
    const [onlinePlayers, setOnlinePlayers] = useState(0);
    const [mobileBasketOpened, setMobileBasketOpened] = useState(false);

    const openLoginModal = () => {
        closeDrawer();
        modals.open({
            children: <LoginForm />,
            size: "50rem",
            padding: "3rem",
            styles: {
                header: {
                    backgroundColor: "transparent",
                }
            }
        });
    }

    useEffect(() => {
        if (settings.server_ip) {
            fetch(`https://api.mcsrvstat.us/3/${settings.server_ip}`).then(res => res.json()).then(data => {
                setOnlinePlayers(data.players.online);
            });
        }
    }, []);

    const navVisibility = settings.navbar_links || {};
    const iconFor = (key) => {
        if (typeof key === 'string' && key.includes('fa-')) return <i className={key} style={{ fontSize: '1.1rem' }} />;
        if (key === 'home') return <TbHome size="1.2rem" />;
        if (key === 'store') return <TbShoppingCart size="1.2rem" />;
        if (key === 'vote') return <TbTrophy size="1.2rem" />;
        if (key === 'blog') return <TbArticle size="1.2rem" />;
        if (key === 'rules') return <TbSchool size="1.2rem" />;
        if (key === 'wiki') return <TbBook2 size="1.2rem" />;
        if (key === 'pencil') return <TbPencil size="1.2rem" />;
        return <TbNote size="1.2rem" />;
    };

    const builtInLinks = [
        { key: 'home', label: t('home'), href: '/', show: navVisibility.home !== false, external: false },
        { key: 'store', label: t('store'), href: '/store', show: navVisibility.store !== false, external: false },
        { key: 'vote', label: t('vote'), href: '/vote', show: navVisibility.vote !== false, external: false },
        { key: 'blog', label: t('blog'), href: '/blog', show: navVisibility.blog !== false && settings.blog_system.enabled, external: false },
        { key: 'rules', label: t('rules'), href: '/rules', show: navVisibility.rules !== false, external: false },
        { key: 'wiki', label: t('wiki'), href: settings.wiki_link?.url, show: navVisibility.wiki !== false && settings.wiki_link?.shown && !!settings.wiki_link?.url, external: true },
    ].filter((link) => link.show);

    const extraPages = Array.isArray(settings.extra_pages?.pages) ? settings.extra_pages.pages : [];
    const extraLinks = extraPages
        .filter((p) => p?.label && p?.link)
        .map((p) => ({
            key: p.icon || 'note',
            label: p.label,
            href: p.link.startsWith('/') ? p.link : `/${p.link}`,
            show: true,
            external: /^https?:\/\//i.test(p.link),
        }));

    const navbarLinks = [...builtInLinks, ...extraLinks];

    return (
        <Box className="navbar scrolled navbar-glass">
            <Container py="0.8rem">
                <header>
                    <Group pos="relative" style={{ zIndex: 5 }} justify="space-between" h="100%">
                        <Group gap="4rem">
                            <Link href="/">
                                <Image onClick={closeDrawer} style={{ zIndex: 10 }} src={settings.navbar_logo_url} alt={settings.server_name} w="auto" h={70} />
                            </Link>
                            <Group gap="2rem" h="100%" visibleFrom="md">
                                {navbarLinks.map((item) => (
                                    <Group
                                        key={`${item.href}-${item.label}`}
                                        td="none"
                                        c="bright"
                                        component={Link}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        gap="0.4rem"
                                    >
                                        {iconFor(item.key)}
                                        <Text size="lg">{item.label}</Text>
                                    </Group>
                                ))}
                            </Group>
                        </Group>

                        <Group gap="2rem" visibleFrom="md">
                            <Group>
                                <LanguageSwitcher />
                                {!loading && user && (
                                    <Basket user={user} />
                                )}
                                {!loading && (
                                    <Button bg="var(--app-primary-color)" h="3.1rem" leftSection={<TbUserFilled />} size="lg" variant="login" onClick={openLoginModal}>
                                        <Text fw={600}>{!user ? t('login') : user?.name}</Text>
                                    </Button>
                                )}
                            </Group>
                            <JoinButton>
                                <Button className="play-button" size="lg">
                                    <Stack align="center" gap={5}>
                                        <Text mb="-0.2rem" fw={700}><NumberFormatter prefix="" value={onlinePlayers} /> {t('online')}</Text>
                                        <Group gap="0.2rem">
                                            <TbCopy size="0.9rem" />
                                            <Text mb="-2px" size="xs" mt="-0.2rem" fw={700}>{settings.server_ip}</Text>
                                        </Group>
                                    </Stack>
                                </Button>
                            </JoinButton>
                        </Group>

                        <Burger color="var(--app-neutral-white)" style={{ zIndex: 10 }} opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" />
                    </Group>
                </header>
            </Container>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="20rem"
                closeButtonProps={{
                    c: "var(--app-neutral-white)"
                }}
                styles={{
                    header: {
                        backgroundColor: "transparent"
                    }
                }}
                title={<Link href="/"><Image src={settings.navbar_logo_url} alt={settings.server_name} w="auto" h={100} /></Link>}
                padding="md"
                hiddenFrom="md"
                zIndex={1000}
            >
                <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
                    <Stack mx="1rem">
                        {navbarLinks.map((item) => (
                            <Anchor
                                key={`${item.href}-${item.label}`}
                                onClick={closeDrawer}
                                size="lg"
                                fw={800}
                                c="bright"
                                component={Link}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                            >
                                <Group gap="0.4rem">
                                    {iconFor(item.key)}
                                    <Text size="lg">{item.label}</Text>
                                </Group>
                            </Anchor>
                        ))}
                        <Group>
                            <LanguageSwitcher />
                            {(user !== null && user !== "") && (
                                <ActionIcon
                                    onClick={() => {
                                        closeDrawer();
                                        setMobileBasketOpened(true);
                                    }}
                                    bg="var(--app-primary-color)"
                                    c="var(--app-neutral-black)"
                                    w="3rem"
                                    h="3rem"
                                    pos="relative"
                                >
                                    {basket?.data?.packages?.length > 0 && (
                                        <Box ta="center" fw={700} fz="sm" pos="absolute" bottom={4} right={3} w="1rem" h="1.2rem" bg="primary.5" c="var(--app-neutral-black)" radius="50%" style={{ zIndex: 2 }}>
                                            {basket?.data?.packages?.length}
                                        </Box>
                                    )}
                                    <TbBasket color="var(--app-neutral-black)" style={{ cursor: "pointer" }} size="1.8rem" />
                                </ActionIcon>
                            )}
                        </Group>
                        {user !== null && (
                            <Button bg="var(--app-primary-color)" h="3.1rem" leftSection={<TbUserFilled />} size="lg" variant="login" onClick={openLoginModal}>
                                <Text fw={600}>{user === "" ? t('login') : user?.name}</Text>
                            </Button>
                        )}
                        <JoinButton>
                            <Button className="play-button" size="lg">
                                <Stack align="center" gap={5}>
                                    <Text mb="-0.2rem" fw={700}><NumberFormatter prefix="" value={onlinePlayers} /> {t('online')}</Text>
                                    <Group gap="0.2rem">
                                        <TbCopy size="0.9rem" />
                                        <Text mb="-2px" size="xs" mt="-0.2rem" fw={700}>{settings.server_ip}</Text>
                                    </Group>
                                </Stack>
                            </Button>
                        </JoinButton>
                    </Stack>
                </ScrollArea>
            </Drawer>
            {(user !== null && user !== "") && (
                <Basket
                    user={user}
                    hideIcon
                    forceOpen={mobileBasketOpened}
                    onClose={() => setMobileBasketOpened(false)}
                />
            )}
        </Box>
    );
}

