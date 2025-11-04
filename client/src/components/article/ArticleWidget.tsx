import { ReactNode } from "react";

interface ArticleWidgetProps {
  children: ReactNode;
  title?: string;
}

export function ArticleWidget({ children, title }: ArticleWidgetProps) {
  return (
    <div className="not-prose my-12">
      <div className="bg-muted/30 border border-border rounded-lg p-6 md:p-8">
        {title && (
          <h3 className="text-xl font-bold mb-6 text-foreground">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
