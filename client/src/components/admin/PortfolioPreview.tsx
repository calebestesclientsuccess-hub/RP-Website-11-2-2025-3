import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Expand, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PreviewMode = "grid" | "expansion";

export interface PortfolioPreviewData {
  title: string;
  clientName: string;
  thumbnailUrl: string;
  categories: string[];
  challengeText: string;
  solutionText: string;
  outcomeText: string;
  testimonialText?: string;
  testimonialAuthor?: string;
  heroMediaUrl?: string;
}

interface PortfolioPreviewProps {
  data: PortfolioPreviewData;
  className?: string;
}

export function PortfolioPreview({ data, className }: PortfolioPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("grid");

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Live Preview
        </span>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("grid")}
            className={cn(
              "h-7 px-3 text-xs",
              mode === "grid" && "bg-background shadow-sm"
            )}
          >
            <Grid3X3 className="w-3.5 h-3.5 mr-1.5" />
            Grid
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("expansion")}
            className={cn(
              "h-7 px-3 text-xs",
              mode === "expansion" && "bg-background shadow-sm"
            )}
          >
            <Expand className="w-3.5 h-3.5 mr-1.5" />
            Expanded
          </Button>
        </div>
      </div>

      {/* Preview container with fixed aspect ratio */}
      <div className="flex-1 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full p-6 flex items-center justify-center"
            >
              <GridPreview data={data} />
            </motion.div>
          ) : (
            <motion.div
              key="expansion"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <ExpansionPreview data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        {mode === "grid"
          ? "This is how your portfolio appears in the grid"
          : "This is what visitors see when they click"}
      </p>
    </div>
  );
}

function GridPreview({ data }: { data: PortfolioPreviewData }) {
  const hasImage = Boolean(data.thumbnailUrl?.trim());
  const hasTitle = Boolean(data.title?.trim() || data.clientName?.trim());

  return (
    <div className="w-full max-w-[280px] rounded-xl shadow-xl overflow-hidden bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={data.thumbnailUrl}
            alt={data.title || "Project thumbnail"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-muted-foreground/50 text-sm">
              Drop hero image
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-base font-bold mb-1 truncate">
            {data.clientName?.trim() || (
              <span className="text-white/50">Client Name</span>
            )}
          </h3>
          <p className="text-xs text-white/90 mb-2 truncate">
            {data.title?.trim() || (
              <span className="text-white/50">Project Title</span>
            )}
          </p>

          <div className="flex flex-wrap gap-1">
            {data.categories && data.categories.length > 0 ? (
              data.categories.slice(0, 3).map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0"
                >
                  {category}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white/50 border-white/20 text-[10px] px-1.5 py-0"
              >
                Add categories
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpansionPreview({ data }: { data: PortfolioPreviewData }) {
  const hasHeroMedia =
    Boolean(data.heroMediaUrl?.trim()) || Boolean(data.thumbnailUrl?.trim());
  const heroSrc = data.heroMediaUrl?.trim() || data.thumbnailUrl?.trim();

  return (
    <div className="bg-card">
      {/* Hero section */}
      <div className="relative aspect-[21/9] overflow-hidden bg-muted">
        {hasHeroMedia ? (
          <img
            src={heroSrc}
            alt={data.title || "Hero"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-muted-foreground/50 text-sm">
              Hero media appears here
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">
            {data.clientName?.trim() || (
              <span className="text-muted-foreground">Client Name</span>
            )}
          </h2>
          <p className="text-base text-muted-foreground">
            {data.title?.trim() || (
              <span className="text-muted-foreground/50">Project Title</span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.categories && data.categories.length > 0 ? (
              data.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground/50"
              >
                No categories
              </Badge>
            )}
          </div>
        </div>

        {/* Story sections */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <StorySection
            title="The Challenge"
            content={data.challengeText}
            placeholder="What problem kept your client up at night?"
          />
          <StorySection
            title="Our Solution"
            content={data.solutionText}
            placeholder="What did you build to fix it?"
          />
          <StorySection
            title="The Outcome"
            content={data.outcomeText}
            placeholder="What's the proof that it worked?"
          />
        </div>

        {/* Testimonial */}
        {(data.testimonialText?.trim() || data.testimonialAuthor?.trim()) && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm italic mb-2">
              {data.testimonialText?.trim() ? (
                `"${data.testimonialText}"`
              ) : (
                <span className="text-muted-foreground/50">
                  "Testimonial quote..."
                </span>
              )}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              — {data.testimonialAuthor?.trim() || "Author name"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StorySection({
  title,
  content,
  placeholder,
}: {
  title: string;
  content?: string;
  placeholder: string;
}) {
  const hasContent = Boolean(content?.trim());

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-foreground">{title}</h3>
      <p
        className={cn(
          "text-xs leading-relaxed",
          hasContent ? "text-muted-foreground" : "text-muted-foreground/40 italic"
        )}
      >
        {hasContent ? content : placeholder}
      </p>
    </div>
  );
}

