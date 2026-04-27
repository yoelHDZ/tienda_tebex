import { redirect } from "next/navigation";
import BlogClient from "../../../../components/BlogClient";
import { settings } from "../../../../utils/settings";
import { getBlogs } from "../../../../utils/getBlogs";
import { getTranslations } from 'next-intl/server';

export const metadata = {
    title: "Blog | " + settings.server_name,
    description: "The " + settings.server_name + " Blog: News, Updates, and Community Stories",
};

export default async function BlogPage() {
    if (!settings.blog_system.enabled) {
        return redirect("/")
    }

    const t = await getTranslations('Blog');
    const posts = await getBlogs();
    return <BlogClient posts={posts} />;
} 