import { Carousel, CarouselSlide } from "@mantine/carousel";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Badge,
    Box,
    Container,
    Divider,
    Group,
    Image,
    Paper,
    rem,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import parse from "html-react-parser";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import BlogCard from "../../../../../components/BlogCard";
import { getBlogBySlug } from "../../../../../utils/getBlogBySlug";
import { getTimeAgo } from "../../../../../utils/getTimeAgo";
import { getBlogs } from "../../../../../utils/getBlogs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { settings } from "../../../../../utils/settings";

export default async function Page({ params }) {
    if (!settings.blog_system.enabled) {
        return redirect("/")
    }

    const t = await getTranslations('Blog');
    const { slug } = await params;

    const blog = await getBlogBySlug(slug);

    if (!blog) {
        return notFound();
    }

    const allPosts = await getBlogs();

    return (
        <Container>
            <Paper pt="2rem" p="1rem" pos="relative">
                <Tooltip label={t('backToBlog')}>
                    <Anchor pos="absolute" left="1rem" top="-1rem" component={Link} td="none" href="/blog">
                        <ActionIcon size="lg" color="primary" c="bright">
                            <TbChevronLeft size="1.2rem" color="var(--app-neutral-black)" />
                        </ActionIcon>
                    </Anchor>
                </Tooltip>
                <Group justify="space-between">
                    <Group mb="1rem">
                        {blog.primary_author?.profile_image && (
                            <Avatar
                                src={blog.primary_author.profile_image}
                                round
                                size="lg"
                            />
                        )}
                        <div>
                            <Text c="bright" size="xl" mb="-0.2rem" fw={500}>{blog.primary_author?.name || 'Admin'}</Text>
                            <Text fz="md" c="dimmed">
                                {t('posted')} {getTimeAgo(blog.published_at)}
                            </Text>
                        </div>
                    </Group>
                </Group>
                <Box mb="1rem">
                    {blog.tags && Array.isArray(blog.tags) && blog.tags.map(tag => (
                        <Badge radius={4} key={tag.name || tag} variant="light" color="primary">{typeof tag === 'string' ? tag : tag.name}</Badge>
                    ))}
                </Box>
                <Image fit="cover" mb="3rem" radius={10} src={blog.feature_image} alt={blog.title + " cover image"}
                    height={400} />
                <Title fz={{ base: "2rem", md: "2.4rem" }}>
                    {blog.title}
                </Title>
                <Box fz="xl">
                    {parse(blog.html)}
                </Box>
            </Paper>
            <Stack mt="2rem" align="center">
                <Title mt="2rem" fz={{ base: "2rem", md: "3rem" }} ta="center" order={2}>
                    {t('moreFromUs')}
                </Title>
                <Text mb="1rem" maw="40rem" size="lg" ta="center" c="dimmed">
                    {t('exploreTopPosts')}
                </Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {allPosts.map((post) => (
                    <BlogCard post={post} />
                ))}
            </SimpleGrid>
        </Container>
    )
}