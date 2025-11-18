
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const QUICK_PROMPTS = [
  {
    label: "Make it more dramatic",
    prompt: "Increase all entry durations to 2.5s+ and use more intense animations like 'zoom-in' and 'spiral-in'.",
  },
  {
    label: "Speed up transitions",
    prompt: "Reduce all entry and exit durations to 0.8-1.2s for a fast-paced feel.",
  },
  {
    label: "Add parallax everywhere",
    prompt: "Set parallaxIntensity to 0.5 on all image/video scenes for depth.",
  },
  {
    label: "Darker color palette",
    prompt: "Change all backgrounds to dark colors (#0a0a0a, #1a1a1a) with light text (#ffffff).",
  },
  {
    label: "Larger, bolder text",
    prompt: "Increase headingSize to 7xl-8xl and fontWeight to 'bold' across all scenes.",
  },
  {
    label: "Cinematic scroll effects",
    prompt: "Enable fadeOnScroll and parallax on all scenes, disable scaleOnScroll to prevent conflicts.",
  },
  {
    label: "Minimal clean look",
    prompt: "Use simple 'fade' animations, remove all scroll effects, set alignment to 'center'.",
  },
  {
    label: "Fix animation conflicts",
    prompt: "Review all scenes and disable scaleOnScroll where parallaxIntensity > 0.",
  },
];

export function QuickPrompts({ onSelectPrompt }: QuickPromptsProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Quick Prompts</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <Button
            key={prompt.label}
            variant="outline"
            size="sm"
            className="justify-start h-auto py-2 text-xs"
            onClick={() => onSelectPrompt(prompt.prompt)}
          >
            {prompt.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
