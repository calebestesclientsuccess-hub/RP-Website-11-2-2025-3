import { motion } from "framer-motion";
import { Check, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofItem {
  id: string;
  label: string;
  complete: boolean;
  required?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
}

interface ProofStrengthProps {
  /** Items that contribute to proof strength */
  items: ProofItem[];
  /** Optional suggestions for improvement */
  suggestions?: Suggestion[];
  /** Optional className for the container */
  className?: string;
}

type StrengthLevel = "weak" | "building" | "solid" | "strong" | "compelling";

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; bgColor: string }
> = {
  weak: {
    label: "Weak",
    color: "text-red-500",
    bgColor: "bg-red-500",
  },
  building: {
    label: "Building",
    color: "text-amber-500",
    bgColor: "bg-amber-500",
  },
  solid: {
    label: "Solid",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  strong: {
    label: "Strong",
    color: "text-lime-500",
    bgColor: "bg-lime-500",
  },
  compelling: {
    label: "Compelling",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
  },
};

function getStrengthLevel(percentage: number): StrengthLevel {
  if (percentage < 20) return "weak";
  if (percentage < 40) return "building";
  if (percentage < 60) return "solid";
  if (percentage < 80) return "strong";
  return "compelling";
}

export function ProofStrength({
  items,
  suggestions = [],
  className,
}: ProofStrengthProps) {
  const requiredItems = items.filter((item) => item.required !== false);
  const completedRequired = requiredItems.filter((item) => item.complete);
  const allCompleted = items.filter((item) => item.complete);

  // Calculate percentage based on required items primarily
  const requiredPercentage =
    requiredItems.length > 0
      ? (completedRequired.length / requiredItems.length) * 100
      : 0;

  // Bonus for optional items (up to 20% extra)
  const optionalItems = items.filter((item) => item.required === false);
  const completedOptional = optionalItems.filter((item) => item.complete);
  const optionalBonus =
    optionalItems.length > 0
      ? (completedOptional.length / optionalItems.length) * 20
      : 0;

  const totalPercentage = Math.min(100, requiredPercentage * 0.8 + optionalBonus);
  const strengthLevel = getStrengthLevel(totalPercentage);
  const config = strengthConfig[strengthLevel];

  const incompleteRequired = requiredItems.filter((item) => !item.complete);
  const incompleteOptional = optionalItems.filter((item) => !item.complete);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with strength label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Proof Strength
        </span>
        <span className={cn("text-sm font-semibold", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", config.bgColor)}
          initial={{ width: 0 }}
          animate={{ width: `${totalPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Threshold markers */}
        <div className="absolute inset-0 flex">
          {[20, 40, 60, 80].map((threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-background/50"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>
      </div>

      {/* Completed items */}
      {allCompleted.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">
            Strong Points
          </span>
          <ul className="space-y-1">
            {allCompleted.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing required items */}
      {incompleteRequired.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-amber-500 uppercase tracking-wide">
            Needs Work
          </span>
          <ul className="space-y-1">
            {incompleteRequired.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing optional items (shown as suggestions) */}
      {incompleteOptional.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Optional Enhancements
          </span>
          <ul className="space-y-1">
            {incompleteOptional.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground/70"
              >
                <Lightbulb className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <ul className="space-y-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="flex items-start gap-2 text-sm text-muted-foreground/70 italic"
              >
                <Lightbulb className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                <span>{suggestion.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Helper to create proof items from form data
 */
export function createProofItems(data: {
  title?: string;
  categories?: string[];
  thumbnailUrl?: string;
  clientName?: string;
  challengeText?: string;
  solutionText?: string;
  outcomeText?: string;
  testimonialText?: string;
  testimonialAuthor?: string;
  heroMediaUrl?: string;
}): ProofItem[] {
  return [
    {
      id: "title",
      label: "Project title is set",
      complete: Boolean(data.title?.trim()),
      required: true,
    },
    {
      id: "categories",
      label: "Categories are tagged",
      complete: Boolean(data.categories && data.categories.length > 0),
      required: true,
    },
    {
      id: "thumbnail",
      label: "Hero image captures attention",
      complete: Boolean(data.thumbnailUrl?.trim()),
      required: true,
    },
    {
      id: "client",
      label: "Client name is credited",
      complete: Boolean(data.clientName?.trim()),
      required: true,
    },
    {
      id: "challenge",
      label: "The problem is clear",
      complete: Boolean(data.challengeText?.trim()),
      required: true,
    },
    {
      id: "solution",
      label: "The journey is told",
      complete: Boolean(data.solutionText?.trim()),
      required: true,
    },
    {
      id: "outcome",
      label: "The result is proven",
      complete: Boolean(data.outcomeText?.trim()),
      required: true,
    },
    {
      id: "testimonial",
      label: "A voice vouches for you",
      complete: Boolean(
        data.testimonialText?.trim() && data.testimonialAuthor?.trim()
      ),
      required: false,
    },
    {
      id: "heroMedia",
      label: "Hero video adds impact",
      complete: Boolean(data.heroMediaUrl?.trim()),
      required: false,
    },
  ];
}

