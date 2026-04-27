'use client';

import { Badge, Box, Button, Card, Container, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { TbSearch } from "react-icons/tb";
import { useSettings } from "../contexts/SettingsContext";
import BlogCard from "./BlogCard";
import { useTranslations } from "next-intl";

export default function BlogClient({ posts }) {
    const t = useTranslations("Blog");
    const settings = useSettings();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 4;
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.ceil(filteredPosts.length / pageSize);
    const paginatedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <Container mb="2rem" pos="relative" style={{ zIndex: 1 }}>
                <Grid>
                    <GridCol span={{ base: 12, md: 3 }}>
                        <Card mb="1rem" p="1rem">
                            <Title order={2} fz="1.4rem" c="bright" mb="xs">{t('welcome')}</Title>
                            <Text c="dimmed" fz="md">{t('discover')}</Text>
                        </Card>
                        {posts.length > 0 && (() => {
                            const latest = [...posts].sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];
                            return (
                                <Card mb="1rem" p="1rem">
                                    {latest.feature_image && (
                                        <Card.Section mb="sm">
                                            <Image src={latest.feature_image} alt={latest.title} h={120} w="100%" fit="cover" />
                                        </Card.Section>
                                    )}
                                    <Title order={4} fz="1rem" mb="xs" style={{ lineHeight: 1.2 }}>{t('latest')}: {latest.title}</Title>
                                    <Text c="dimmed" fz="sm" mb="md" lineClamp={2} style={{ lineHeight: 1.5 }}>{latest.excerpt}</Text>
                                    <Button component="a" href={`/blog/${latest.slug}`} target="_blank" size="sm" fullWidth variant="filled" colour="primary">{t('readArticle')}</Button>
                                </Card>
                            );
                        })()}
                        <Card mb="1rem" p="1rem">
                            <Title c="bright" mb="0.6rem" order={2}>{t('needHelp')}</Title>
                            <Text mb="1rem" size="lg">{t('joinDiscordHelp')}</Text>
                            <Button color="primary" component={Link} leftSection={<FaDiscord size="1rem" />} href={settings.discord_url} target="_blank">{t('joinDiscord')}</Button>
                        </Card>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 9 }}>
                        <Paper>
                            <TextInput styles={{ input: { backgroundColor: "transparent" } }} leftSection={<TbSearch size="1.2rem" />} mb="1rem" size="lg" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
                        </Paper>
                        {filteredPosts.length === 0 ? (
                            <Text ta="center" c="dimmed" fz="lg" mt="4rem">{t('noPostsFound')}</Text>
                        ) : (
                            <>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="1rem">
                                    {paginatedPosts.map(post => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </SimpleGrid>
                                {totalPages > 1 && (
                                    <Group mt="lg" justify="center">
                                        <Pagination value={page} onChange={setPage} total={totalPages} size="lg" />
                                    </Group>
                                )}
                            </>
                        )}
                    </GridCol>
                </Grid>
            </Container>

            <Container>
                <Card p="4rem">
                    <Group justify="space-between">
                        <div>
                            <Text c="bright" fw={600} fz="2rem">{t("needHelpSomething")}</Text>
                            <Text>{t("askTeam")}</Text>
                        </div>
                        <Button leftSection={<FaDiscord size="1.3rem" />} component={Link} href={settings.discord_url} target="_blank" size="lg">{t("joinDiscord")}</Button>
                    </Group>
                </Card>
            </Container>
        </>
    );
} 