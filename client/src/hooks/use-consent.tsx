import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAnalyticsConsent } from "@/lib/analytics";

type ConsentValue = "unknown" | "granted" | "denied";

interface ConsentContextValue {
  consent: ConsentValue;
  accept: () => void;
  reject: () => void;
  pending: boolean;
}

const CONSENT_STORAGE_KEY = "revparty_analytics_consent_v1";

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue>(() => {
    if (typeof window === "undefined") {
      return "unknown";
    }
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      return stored;
    }
    return "unknown";
  });

  useEffect(() => {
    setAnalyticsConsent(consent === "granted");
    if (typeof window !== "undefined" && consent !== "unknown") {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
    }
  }, [consent]);

  const actions = useMemo(
    () => ({
      consent,
      accept: () => setConsent("granted"),
      reject: () => setConsent("denied"),
      pending: consent === "unknown",
    }),
    [consent],
  );

  return <ConsentContext.Provider value={actions}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

