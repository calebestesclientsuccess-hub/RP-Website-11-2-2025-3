interface ContentSectionProps {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
  background?: "default" | "muted";
}

export function ContentSection({ heading, subheading, children, background = "default" }: ContentSectionProps) {
  const bgClass = background === "muted" ? "bg-muted/20" : "";
  
  return (
    <section className={`py-16 px-4 md:px-6 lg:px-8 ${bgClass}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-content-section">
          {heading}
        </h2>
        
        {subheading && (
          <p className="text-xl font-semibold text-muted-foreground mb-8" data-testid="text-subheading">
            {subheading}
          </p>
        )}
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {children}
        </div>
      </div>
    </section>
  );
}
