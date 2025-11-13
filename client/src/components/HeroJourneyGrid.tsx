
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ArchitectContribution {
  title: string;
  description: string;
  icon: JSX.Element;
}

interface HeroJourneyGridProps {
  contributions: ArchitectContribution[];
}

export function HeroJourneyGrid({ contributions }: HeroJourneyGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      {contributions.map((contribution, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6 h-full light-depth hover-elevate transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {contribution.icon}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-2">{contribution.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {contribution.description}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
