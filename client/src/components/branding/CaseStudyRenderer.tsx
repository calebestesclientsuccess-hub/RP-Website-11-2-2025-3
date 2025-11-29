import { useMemo } from "react";
import { CaseStudyContent } from "@shared/schema";
import { BlockText } from "./blocks/BlockText";
import { BlockCarousel } from "./blocks/BlockCarousel";
import { CaseStudyWrapper } from "./CaseStudyWrapper";
import { getContrastColor } from "@/lib/color-utils";

type RendererProps = {
  content: CaseStudyContent;
};

function renderBlock(block: any) {
  switch (block.type) {
    case "text":
      return <BlockText key={block.id} content={block.content} layout={block.layout} />;
    case "carousel":
      return (
        <BlockCarousel
          key={block.id}
          items={block.items || []}
          aspectRatio={block.aspectRatio || "video"}
        />
      );
    case "stat-grid":
      return (
        <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {block.stats?.map((stat: any, idx: number) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-brand-border bg-brand-bg/40 text-brand-text"
            >
              <p className="text-sm uppercase tracking-wide opacity-70">
                {stat.label}
              </p>
              <p className="text-4xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div
          key={block.id}
          className="border border-dashed border-border rounded-xl p-6 text-sm text-muted-foreground"
        >
          Unsupported block type: {block.type}
        </div>
      );
  }
}

export function CaseStudyRenderer({ content }: RendererProps) {
  const sections =
    content.sections?.map((section) => {
      const theme = section.theme || {};
      const autoText =
        theme.backgroundColor && !theme.textColor
          ? getContrastColor(theme.backgroundColor)
          : undefined;

      return {
        ...section,
        theme: {
          ...theme,
          textColor: theme.textColor || autoText,
        },
      };
    }) ?? [];

  const toc = useMemo(
    () =>
      sections.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    [sections],
  );

  return (
    <div className="relative lg:flex lg:gap-10">
      <aside className="hidden lg:block lg:w-64 sticky top-24 h-[calc(100vh-6rem)] overflow-auto border-r border-border pr-6">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Sections
        </h3>
        <ol className="space-y-3 text-sm">
          {toc.map((entry, index) => (
            <li key={entry.id}>
              <a
                href={`#section-${entry.id}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {index + 1}. {entry.title}
              </a>
            </li>
          ))}
        </ol>
      </aside>

      <div className="flex-1 space-y-24">
        {sections.map((section) => (
          <section
            id={`section-${section.id}`}
            key={section.id}
            className="space-y-10"
          >
            <CaseStudyWrapper theme={section.theme}>
              <div className="space-y-6">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-wide text-brand-text/70">
                    Section
                  </p>
                  <h2 className="text-4xl font-semibold text-brand-text">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-12">
                  {section.blocks?.map((block: any) => (
                    <ErrorBoundary key={block.id}>{renderBlock(block)}</ErrorBoundary>
                  ))}
                </div>
              </div>
            </CaseStudyWrapper>
          </section>
        ))}
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("CaseStudyRenderer block failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive/30 rounded-xl p-6 text-sm text-destructive bg-destructive/5">
          This block failed to render.
        </div>
      );
    }
    return this.props.children;
  }
}









