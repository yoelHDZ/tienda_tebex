import { cookies } from "next/headers";
import { Container } from "@mantine/core";
import { promises as fs } from "fs";
import path from "path";
import BlogEditor from "../../../../../components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Blog Post | Admin",
  description: "Edit an existing blog post on your store blog.",
};

export default async function Page({ params }) {
  const jar = await cookies();
  const pass = jar.get("admin-pass")?.value || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  const authed = expected && pass === expected;
  if (!authed) return null;
  const { id } = await params;

  let post = null;
  try {
    const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');
    const data = await fs.readFile(blogsPath, 'utf8');
    const posts = JSON.parse(data);
    post = (Array.isArray(posts) ? posts : []).find(p => (p.id || p.slug) === id) || null;
  } catch {}

  return (
    <Container mt="5rem" size={900}>
      <BlogEditor initialPost={post} />
    </Container>
  );
}
