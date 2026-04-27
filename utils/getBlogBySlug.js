import axios from "axios";
import fs from "fs";
import path from "path";
import { marked } from "marked";
import { getDemoBlogs } from "./demoBlogs";
import { settings } from "./settings";

const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');

function getInternalBlogBySlug(slug) {
    try {
        const data = fs.readFileSync(blogsPath, 'utf8');
        const posts = JSON.parse(data);
        const post = (Array.isArray(posts) ? posts : []).find(p => p.slug === slug);
        if (!post) return null;
        return {
            ...post,
            html: post.content ? marked.parse(post.content) : (post.html || ''),
        };
    } catch {
        return null;
    }
}

export async function getBlogBySlug(slug) {
    if (process.env.NEXT_PUBLIC_IS_DEMO) {
        return getDemoBlogs().find(blog => blog.slug === slug);
    }

    const blogSource = settings.blog_system.blog_source || 'GhostCMS';

    if (blogSource === 'Internal') {
        return getInternalBlogBySlug(slug);
    }

    try {
        const res = await axios.get(`${settings.blog_system.ghost_url}/ghost/api/content/posts/?key=${settings.blog_system.ghost_api_key}&include=tags,authors&filter=slug:${slug}`);
        return res.data.posts[0];
    } catch {
        return null;
    }
}
