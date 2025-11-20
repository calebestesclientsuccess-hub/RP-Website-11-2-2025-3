import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  selector?: string;
}

interface GuidedTourProps {
  open: boolean;
  steps: GuidedTourStep[];
  currentIndex: number;
  onStepChange: (index: number) => void;
  onClose: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function GuidedTour({
  open,
  steps,
  currentIndex,
  onStepChange,
  onClose,
}: GuidedTourProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[currentIndex];

  useLayoutEffect(() => {
    if (!open || !currentStep) {
      setTargetRect(null);
      return;
    }

    const el = currentStep.selector
      ? (document.querySelector(currentStep.selector) as HTMLElement | null)
      : null;

    if (!el) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    };

    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(el);
    const handleResize = () => updateRect();
    window.addEventListener("resize", handleResize);
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [open, currentStep]);

  useEffect(() => {
    if (!open) {
      setTargetRect(null);
    }
  }, [open]);

  const contentPosition = useMemo(() => {
    if (!targetRect) {
      return {
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 200,
      };
    }
    const top = clamp(targetRect.bottom + 16, 16, window.innerHeight - 220);
    const left = clamp(targetRect.left + targetRect.width / 2 - 200, 16, window.innerWidth - 360);
    return { top, left };
  }, [targetRect]);

  if (!open || !currentStep) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      {targetRect && (
        <div
          className="absolute border-2 border-primary/80 rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}
      <div
        className="absolute pointer-events-auto max-w-sm rounded-2xl bg-background border shadow-2xl"
        style={{ top: contentPosition.top, left: contentPosition.left }}
      >
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Step {currentIndex + 1} of {steps.length}
            </p>
            <h3 className="text-lg font-semibold">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Skip tour
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStepChange(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                className={cn({ "bg-emerald-600 hover:bg-emerald-600/90": currentIndex === steps.length - 1 })}
                onClick={() => {
                  if (currentIndex === steps.length - 1) {
                    onClose();
                  } else {
                    onStepChange(currentIndex + 1);
                  }
                }}
              >
                {currentIndex === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


