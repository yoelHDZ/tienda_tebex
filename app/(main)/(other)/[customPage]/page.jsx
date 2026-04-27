import { Box, Container, Paper, Title } from "@mantine/core";
import parse from "html-react-parser";
import { marked } from "marked";
import { notFound } from "next/navigation";
import { settings } from "../../../../utils/settings";

function getExtraPage(customPage) {
  const pages = Array.isArray(settings.extra_pages?.pages) ? settings.extra_pages.pages : [];
  const matchPath = `/${customPage}`;
  return pages.find((page) => page?.link === matchPath);
}

export async function generateMetadata({ params }) {
  const { customPage } = await params;
  const page = getExtraPage(customPage);
  if (!page) {
    return {
      title: settings.server_name,
    };
  }
  return {
    title: `${page.label} | ${settings.server_name}`,
    description: `${page.label} page`,
  };
}

export default async function Page({ params }) {
  const { customPage } = await params;
  const page = getExtraPage(customPage);

  if (!page) {
    return notFound();
  }

  const content = page.content_type === "html"
    ? String(page.content || "")
    : marked.parse(String(page.content || ""));

  return (
    <Container>
      <Paper p={{ base: "1rem", md: "1.25rem" }}>
        <Title order={1} mb="md">{page.label}</Title>
        <Box className="blog-content">
          {parse(content)}
        </Box>
      </Paper>
    </Container>
  );
}
