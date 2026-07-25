import Link from 'next/link';
import { BlogPostsTable } from '@/components/admin/BlogPostsTable';

export default function AdminBlogPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Blog</h1>
        <Link href="/admin/blog/nuevo/" className="bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian">
          + Nuevo posteo
        </Link>
      </div>
      <BlogPostsTable />
    </div>
  );
}
