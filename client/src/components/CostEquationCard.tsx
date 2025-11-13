
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface CostItem {
  amount: number;
  label: string;
}

interface CostEquationCardProps {
  items: CostItem[];
  total: number;
  totalLabel: string;
}

export function CostEquationCard({ items, total, totalLabel }: CostEquationCardProps) {
  return (
    <Card className="p-8 bg-destructive/5 border-2 border-destructive/30">
      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            {index > 0 && (
              <span className="text-3xl font-bold text-destructive">+</span>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-destructive" />
                <span className="text-2xl font-bold text-destructive">
                  ${item.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          </motion.div>
        ))}
        
        <div className="border-t-2 border-destructive/30 pt-6 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: items.length * 0.1 }}
            className="flex items-center gap-4"
          >
            <span className="text-3xl font-bold text-destructive">=</span>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-destructive" />
                <span className="text-4xl font-bold text-destructive">
                  ${total.toLocaleString()}
                </span>
              </div>
              <p className="text-base font-semibold mt-1">{totalLabel}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}
