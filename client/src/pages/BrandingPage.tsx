import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { BrandingHero } from "@/components/branding/BrandingHero";
import { ProjectGrid } from "@/components/branding/ProjectGrid";
import { ProjectModal } from "@/components/branding/ProjectModal";
import { projects } from "@/data/projects";

export default function BrandingPage() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const handleProjectClick = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
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
          <ProjectGrid onProjectClick={handleProjectClick} />
          <ProjectModal project={selectedProject} onClose={handleCloseModal} />
        </LayoutGroup>
      </div>
    </>
  );
}
