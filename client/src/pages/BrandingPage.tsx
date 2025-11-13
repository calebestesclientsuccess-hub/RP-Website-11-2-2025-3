import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { BrandingHero } from "@/components/branding/BrandingHero";
import { ProjectGrid } from "@/components/branding/ProjectGrid";
import { projects } from "@/data/projects";

export default function BrandingPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handleProjectClick = (projectId: number) => {
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
