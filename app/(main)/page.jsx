import { Container, SimpleGrid, Paper, Title, Text, Button, Stack, Box, Image, Group, Card, Badge, CardSection, Grid, Col, GridCol } from "@mantine/core";
import { settings } from "../../utils/settings";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import RankPopup from "../../components/RankPopup";
import AddToCartButton from "../../components/AddToCartButton";
import { getFeaturedPackages } from "../../utils/getFeaturedPackages";
import { getBlogs } from "../../utils/getBlogs";
import Link from "next/link";
import BlogCard from "../../components/BlogCard.jsx";
import { getTranslations } from 'next-intl/server';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Home | " + settings.server_name,
  description: "Welcome to the " + settings.server_name + " store!",
  openGraph: {
    title: "Home | " + settings.server_name,
    description: "Welcome to the " + settings.server_name + " store!",
  }
}

export default async function Page() {
  const tBlog = await getTranslations('Blog');
  const tStore = await getTranslations('Store');
  const posts = await getBlogs(4);

  let heroPost, otherPosts;
  if (settings.blog_system.home_page_featured_post === "newest") {
    [heroPost, ...otherPosts] = posts;
  } else {
    heroPost = posts.find(post => post.id === settings.blog_system.home_page_featured_post);
    otherPosts = posts.filter(post => post.id !== settings.blog_system.home_page_featured_post);
  }

  const featuredPackages = await getFeaturedPackages();
  return (
    <Container>
      {(heroPost && settings.blog_system.enabled) && (
        <Paper mb="2rem">
          <Grid align="stretch" columns={24} gutter={0} >
            <GridCol mih="100%" span={{ base: 24, md: 11 }} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
              <Stack mih="100%" justify="space-between">
                <div>
                  <Title lineClamp={2} lh={1.1} order={1} fz={{ base: 32 }} mb="xs">
                    {heroPost.title}
                  </Title>
                  <Text fz={{ base: 'md', md: 'lg' }} c="dimmed" mb="md" lineClamp={5}>
                    {heroPost.excerpt}
                  </Text>
                  <Group gap="xs" mb="md">
                    <Text c="dimmed" fz="sm" fw={600}>{tBlog('by', { name: heroPost.primary_author?.name })}</Text>
                    <Text c="dimmed" fz="sm">•</Text>
                    <Text c="dimmed" fz="sm">{new Date(heroPost.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Text>
                  </Group>
                </div>
                <Button size="lg" component="a" href={`/blog/${heroPost.slug}`} target="_blank" variant="filled" colour="primary" mt="md">
                  {tBlog('readMore')}
                </Button>
              </Stack>
            </GridCol>
            <GridCol h="100%" span={{ base: 24, md: 13 }}>
              {heroPost.feature_image && (
                <Image className="hero-post-image" src={heroPost.feature_image} alt={heroPost.title} mah={400} fit="cover" />
              )}
            </GridCol>
          </Grid>
        </Paper>
      )}
      {settings.blog_system.enabled && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="1rem" mb="xl">
          {otherPosts.map(post => (
            <BlogCard post={post} key={post.id} />
          ))}
        </SimpleGrid>
      )}
      {featuredPackages && featuredPackages.length > 0 && (
        <>
          <Paper bg="gold" p="0.2rem 0.8rem" mb="-0.4rem" w="fit-content" pos="relative" style={{ zIndex: 2 }}>
            <Title fz="1.2rem" c="var(--app-neutral-black)" order={2}>{tStore('featuredPackages')}</Title>
          </Paper>
          <Carousel
            slideGap="1rem"
            h={365}
            align="start"
            mb="1rem"
            slideSize={{ base: "100%", sm: "50%", md: "27%" }}
          >
            {featuredPackages.map((item) => (
              <CarouselSlide key={item.data.id}>
                <RankPopup rank={item.data}>
                  <Paper pos="relative" mih="22rem" style={{ cursor: 'pointer' }}>
                    <Group justify="center">
                      <Image mt="2rem" src={item.data.image} alt={item.data.name} mah="14rem" w="auto" />
                    </Group>
                    <Box pos="absolute" px="0.8rem" bottom="0.8rem" w="100%">
                      <Group justify="space-between" gap="0.4rem">
                        <Text c="bright" size="xl" fw={600}>{item.data.name}</Text>
                        <Badge size="lg" c="var(--app-neutral-white)" color="var(--app-dark-background-color)">
                          {item.data.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.currency_symbol}{Number(item.data.total_price + item.data.discount).toFixed(2)}</Text>}
                          &nbsp;{settings.currency_symbol}{Number(item.data.total_price).toFixed(2)}
                        </Badge>
                      </Group>
                      <AddToCartButton package_id={item.data.id} quantity={1} category_id={item.data.category_id} />
                    </Box>
                  </Paper>
                </RankPopup>
              </CarouselSlide>
            ))}
          </Carousel>
        </>
      )}
    </Container>
  );
}
