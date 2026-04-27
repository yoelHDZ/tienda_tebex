import axios from "axios";
import fs from "fs";
import path from "path";
import { marked } from "marked";
import { settings } from "./settings";
import { getDemoBlogs } from "./demoBlogs";

const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');

function getInternalBlogs(limit) {
    try {
        const data = fs.readFileSync(blogsPath, 'utf8');
        const posts = JSON.parse(data);
        return (Array.isArray(posts) ? posts : [])
            .map((post) => ({
                ...post,
                html: post.content ? marked.parse(post.content) : (post.html || ''),
            }))
            .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
            .slice(0, limit);
    } catch {
        return [];
    }
}

export async function getBlogs(limit = 48) {
    if (process.env.NEXT_PUBLIC_IS_DEMO) {
        return getDemoBlogs();
    }

    if (!settings.blog_system.enabled) {
        return [];
    }

    const blogSource = settings.blog_system.blog_source || 'GhostCMS';

    if (blogSource === 'Internal') {
        return getInternalBlogs(limit);
    }

    try {
        const res = await axios.get(`${settings.blog_system.ghost_url}/ghost/api/content/posts/?key=${settings.blog_system.ghost_api_key}&limit=${limit}&include=tags,authors`);
        return res.data.posts || [];
    } catch {
        return [];
    }
}
