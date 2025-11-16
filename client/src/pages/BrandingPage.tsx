import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { BrandingHero } from "@/components/branding/BrandingHero";
import { ProjectGrid } from "@/components/branding/ProjectGrid";
import { ProjectModal } from "@/components/branding/ProjectModal";
import { SEO } from "@/components/SEO";
import { PortfolioSkeleton } from "@/components/skeletons/PortfolioSkeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useQuery } from "@tanstack/react-query";
import { BrandingProject } from "@/types/branding";

export default function BrandingPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projects = [], isLoading, error } = useQuery<BrandingProject[]>({
    queryKey: ['/api/branding/projects'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PortfolioSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage 
            title="Unable to Load Portfolio"
            message="We're having trouble loading the portfolio projects. This could be due to a network issue or server error."
            suggestion="Try refreshing the page or contact support if the problem persists."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
  };

  const handleCloseExpansion = () => {
    setSelectedProjectId(null);
  };

  return (
    <>
      <Helmet>
        <title>Branding & Creative Strategy | Revenue Party</title>
        <meta
          name="description"
          content="Transform your GTM positioning into revenue with Mariya Tamkeen, our Brand Strategist and Creative Director. See portfolio of branding work for B2B SaaS companies."
        />
        <meta property="og:title" content="Branding & Creative Strategy | Revenue Party" />
        <meta
          property="og:description"
          content="Transform your GTM positioning into revenue with expert brand strategy and creative direction."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://revenueparty.com/branding" />
      </Helmet>

      <div className="min-h-screen">
        <BrandingHero />
        <LayoutGroup>
          <ProjectGrid 
            onProjectClick={handleProjectClick} 
            selectedProjectId={selectedProjectId}
            onCloseExpansion={handleCloseExpansion}
          />
        </LayoutGroup>
      </div>
    </>
  );
}