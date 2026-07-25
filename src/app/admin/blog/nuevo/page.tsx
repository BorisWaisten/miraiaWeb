import { BlogPostForm } from '@/components/admin/BlogPostForm';

export default function NuevoBlogPostPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Nuevo posteo</h1>
      <BlogPostForm />
    </div>
  );
}
