import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function SecondaryFitCallButton() {
  return (
    <Button
      variant="outline"
      size="lg"
      asChild
      className="w-full"
      data-testid="button-schedule-fit-call"
    >
      <a href="#calendly-fit-call">
        <Calendar className="mr-2 h-5 w-5" />
        Schedule a Fit Call
      </a>
    </Button>
  );
}
