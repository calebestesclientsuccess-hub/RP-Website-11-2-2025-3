import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/use-consent";
import { useEffect, useState } from "react";

export function CookieConsentBanner() {
  const { consent, accept, reject } = useConsent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(consent === "unknown");
  }, [consent]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="leading-relaxed">
          We use privacy-friendly analytics to improve this experience. Choose “Allow analytics” to help us
          understand usage. You can update your choice anytime in settings.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reject}>
            Reject
          </Button>
          <Button size="sm" onClick={accept}>
            Allow analytics
          </Button>
        </div>
      </div>
    </div>
  );
}

