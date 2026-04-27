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
  await fs.writeFile(blogsPath, JSON.stringify(blogs, null, 2), 'utf8');
}

export async function GET(req, { params }) {
  const jar = await cookies();
  const pass = jar.get('admin-pass')?.value || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  const authed = expected && pass === expected;
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const blogs = await readBlogs();
  const post = blogs.find(p => p.id === id || p.slug === id);

  if (!post) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(req, { params }) {
  const jar = await cookies();
  const pass = jar.get('admin-pass')?.value || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  const authed = expected && pass === expected;
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const blogs = await readBlogs();

    const postIndex = blogs.findIndex(p => p.id === id || p.slug === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const existing = blogs[postIndex];
    blogs[postIndex] = {
      ...existing,
      title: body.title,
      slug: body.slug,
      feature_image: body.feature_image || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
      published_at: body.published_at || existing.published_at,
      tags: body.tags || existing.tags || [],
    };

    await writeBlogs(blogs);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const jar = await cookies();
  const pass = jar.get('admin-pass')?.value || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  const authed = expected && pass === expected;
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const blogs = await readBlogs();
    const filtered = blogs.filter(p => p.id !== id && p.slug !== id);

    if (filtered.length === blogs.length) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await writeBlogs(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
