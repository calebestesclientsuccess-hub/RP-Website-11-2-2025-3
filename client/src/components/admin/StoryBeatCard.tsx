import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type BeatStatus = "empty" | "partial" | "complete";

interface StoryBeatCardProps {
  /** The narrative title shown in the header */
  title: string;
  /** The guiding prompt that coaches the user */
  prompt: string;
  /** Status indicator for the beat */
  status: BeatStatus;
  /** Whether the card is currently expanded */
  isOpen: boolean;
  /** Callback when the card header is clicked */
  onToggle: () => void;
  /** The form content rendered inside the card */
  children: ReactNode;
  /** Optional icon to show in the header */
  icon?: ReactNode;
  /** Optional badge number (1-5) for story order */
  beatNumber?: number;
}

const statusConfig: Record<BeatStatus, { color: string; icon: typeof Check | typeof Circle; label: string }> = {
  empty: {
    color: "text-muted-foreground/50",
    icon: Circle,
    label: "Not started",
  },
  partial: {
    color: "text-amber-500",
    icon: Circle,
    label: "In progress",
  },
  complete: {
    color: "text-emerald-500",
    icon: Check,
    label: "Complete",
  },
};

export function StoryBeatCard({
  title,
  prompt,
  status,
  isOpen,
  onToggle,
  children,
  icon,
  beatNumber,
}: StoryBeatCardProps) {
  const { color, icon: StatusIcon, label } = statusConfig[status];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-300",
        isOpen
          ? "border-primary/30 shadow-lg shadow-primary/5"
          : "border-border hover:border-primary/20 hover:shadow-md"
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-4 p-5 text-left transition-colors",
          isOpen ? "border-b border-border/50" : ""
        )}
        aria-expanded={isOpen}
        aria-label={`${title} - ${label}`}
      >
        {/* Beat number badge */}
        {beatNumber && (
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
              status === "complete"
                ? "bg-emerald-500/20 text-emerald-500"
                : status === "partial"
                ? "bg-amber-500/20 text-amber-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            {beatNumber}
          </div>
        )}

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        )}

        {/* Title and prompt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            <StatusIcon
              className={cn("w-4 h-4 flex-shrink-0", color)}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {prompt}
          </p>
        </div>

        {/* Expand/collapse indicator */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper to determine beat status based on field values
 */
export function getBeatStatus(
  requiredFields: (string | undefined | null)[],
  optionalFields?: (string | undefined | null)[]
): BeatStatus {
  const requiredFilled = requiredFields.filter(
    (f) => f !== undefined && f !== null && f.trim() !== ""
  ).length;

  if (requiredFilled === 0) {
    return "empty";
  }

  if (requiredFilled < requiredFields.length) {
    return "partial";
  }

  return "complete";
}

