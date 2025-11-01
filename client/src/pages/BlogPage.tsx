import { SEO } from "@/components/SEO";

export default function BlogPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO 
        title="GTM Insights & Resources - Revenue Party Blog"
        description="Expert insights on building revenue generation systems, escaping hiring traps, and scaling B2B SaaS sales effectively."
        keywords="GTM blog, sales resources, revenue insights, B2B SaaS"
        canonical="/blog"
      />
      <h1 className="text-4xl font-bold" data-testid="heading-blog">
        Blog / Resources ("The Pillar Page")
      </h1>
    </div>
  );
}
