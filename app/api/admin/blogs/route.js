import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');

async function readBlogs() {
  try {
    const data = await fs.readFile(blogsPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeBlogs(blogs) {
  const dir = path.dirname(blogsPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(blogsPath, JSON.stringify(blogs, null, 2), 'utf8');
}

export async function GET() {
  const jar = await cookies();
  const pass = jar.get('admin-pass')?.value || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  const authed = expected && pass === expected;
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const blogs = await readBlogs();
  return NextResponse.json(blogs);
}

export async function POST(req) {
  const jar = await cookies();
  const pass = jar.get('admin-pass')?.value || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  const authed = expected && pass === expected;
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const blogs = await readBlogs();

    const newPost = {
      id: body.slug || `post-${Date.now()}`,
      title: body.title,
      slug: body.slug,
      feature_image: body.feature_image || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
      published_at: body.published_at || new Date().toISOString(),
      tags: body.tags || [],
      primary_author: {
        name: 'Admin',
        profile_image: ''
      }
    };

    blogs.push(newPost);
    await writeBlogs(blogs);

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save blog post' }, { status: 500 });
  }
}
