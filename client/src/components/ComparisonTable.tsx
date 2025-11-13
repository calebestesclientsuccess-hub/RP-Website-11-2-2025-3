
import { Card } from "@/components/ui/card";
import { XCircle, CheckCircle2 } from "lucide-react";

interface ComparisonItem {
  oldWay: string;
  newWay: string;
}

interface ComparisonTableProps {
  title: string;
  subtitle?: string;
  items: ComparisonItem[];
}

export function ComparisonTable({ title, subtitle, items }: ComparisonTableProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Old Way Column */}
        <Card className="p-6 bg-destructive/5 border-2 border-destructive/30">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
            <h4 className="text-2xl font-bold text-destructive">The Old Way</h4>
          </div>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item.oldWay}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* New Way Column */}
        <Card className="p-6 bg-primary/5 border-2 border-primary">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
            <h4 className="text-2xl font-bold text-primary">The New Way</h4>
          </div>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item.newWay}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
