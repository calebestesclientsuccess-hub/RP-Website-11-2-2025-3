import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  Rocket,
  Loader2,
  Image as ImageIcon,
  MessageSquareQuote,
  Target,
  Lightbulb,
  Trophy,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PortfolioPreviewData } from "./PortfolioPreview";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PortfolioPreviewData;
  onPublish: () => Promise<void>;
  isPublishing?: boolean;
}

interface BeatSummary {
  id: string;
  title: string;
  icon: typeof Check;
  complete: boolean;
  required: boolean;
  preview?: string;
  onJumpTo?: () => void;
}

export function PublishModal({
  open,
  onOpenChange,
  data,
  onPublish,
  isPublishing = false,
}: PublishModalProps) {
  const [publishError, setPublishError] = useState<string | null>(null);

  const beats: BeatSummary[] = [
    {
      id: "hook",
      title: "The Hook",
      icon: Target,
      complete: Boolean(
        data.title?.trim() &&
          data.thumbnailUrl?.trim() &&
          data.categories?.length > 0
      ),
      required: true,
      preview: data.title?.trim() || undefined,
    },
    {
      id: "client",
      title: "The Client",
      icon: User,
      complete: Boolean(data.clientName?.trim()),
      required: true,
      preview: data.clientName?.trim() || undefined,
    },
    {
      id: "promise",
      title: "The Promise",
      icon: Lightbulb,
      complete: Boolean(data.challengeText?.trim()),
      required: true,
      preview: data.challengeText?.trim()?.slice(0, 60) + (data.challengeText?.length > 60 ? "..." : "") || undefined,
    },
    {
      id: "journey",
      title: "The Journey",
      icon: ImageIcon,
      complete: Boolean(data.solutionText?.trim()),
      required: true,
      preview: data.solutionText?.trim()?.slice(0, 60) + (data.solutionText?.length > 60 ? "..." : "") || undefined,
    },
    {
      id: "result",
      title: "The Result",
      icon: Trophy,
      complete: Boolean(data.outcomeText?.trim()),
      required: true,
      preview: data.outcomeText?.trim()?.slice(0, 60) + (data.outcomeText?.length > 60 ? "..." : "") || undefined,
    },
    {
      id: "voice",
      title: "The Voice",
      icon: MessageSquareQuote,
      complete: Boolean(
        data.testimonialText?.trim() && data.testimonialAuthor?.trim()
      ),
      required: false,
      preview: data.testimonialAuthor?.trim() || undefined,
    },
  ];

  const requiredBeats = beats.filter((b) => b.required);
  const optionalBeats = beats.filter((b) => !b.required);
  const incompleteRequired = requiredBeats.filter((b) => !b.complete);
  const canPublish = incompleteRequired.length === 0;

  const handlePublish = async () => {
    setPublishError(null);
    try {
      await onPublish();
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Ready to publish?
          </DialogTitle>
          <DialogDescription>
            {canPublish
              ? `"${data.title || "Untitled"}" is ready to go live in your portfolio showcase.`
              : "Complete the required sections before publishing."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Required beats */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Required
            </span>
            <div className="space-y-1.5">
              {requiredBeats.map((beat) => (
                <BeatRow key={beat.id} beat={beat} />
              ))}
            </div>
          </div>

          {/* Optional beats */}
          {optionalBeats.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Optional Enhancements
              </span>
              <div className="space-y-1.5">
                {optionalBeats.map((beat) => (
                  <BeatRow key={beat.id} beat={beat} />
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail preview */}
          {data.thumbnailUrl?.trim() && (
            <div className="pt-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                Hero Preview
              </span>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={data.thumbnailUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Categories */}
          {data.categories && data.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Error message */}
          {publishError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              {publishError}
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Keep Editing
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || isPublishing}
            className="gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Publish to Showcase
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Incomplete warning */}
        {!canPublish && (
          <p className="text-xs text-muted-foreground text-center -mt-2">
            {incompleteRequired.length} required{" "}
            {incompleteRequired.length === 1 ? "section" : "sections"} still
            needs your attention
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BeatRow({ beat }: { beat: BeatSummary }) {
  const Icon = beat.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
        beat.complete
          ? "bg-emerald-500/5"
          : beat.required
          ? "bg-amber-500/5"
          : "bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          beat.complete
            ? "bg-emerald-500/20 text-emerald-500"
            : beat.required
            ? "bg-amber-500/20 text-amber-500"
            : "bg-muted text-muted-foreground"
        )}
      >
        {beat.complete ? (
          <Check className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              beat.complete ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {beat.title}
          </span>
          {!beat.required && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 text-muted-foreground"
            >
              Optional
            </Badge>
          )}
        </div>
        {beat.preview && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {beat.preview}
          </p>
        )}
        {!beat.complete && beat.required && (
          <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Required to publish
          </p>
        )}
      </div>
    </div>
  );
}

