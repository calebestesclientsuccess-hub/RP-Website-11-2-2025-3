declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
    dataLayer?: Array<Record<string, any>>;
    __revpartyAnalyticsConsent?: boolean;
  }
}

let analyticsAllowed = false;

export function setAnalyticsConsent(allowed: boolean) {
  analyticsAllowed = allowed;
  if (typeof window !== "undefined") {
    window.__revpartyAnalyticsConsent = allowed;
  }
}

export function getAnalyticsConsent(): boolean {
  return analyticsAllowed;
}

const canTrack = () =>
  analyticsAllowed &&
  typeof window !== "undefined" &&
  typeof window.gtag === "function";

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (canTrack()) {
    window.gtag!("event", eventName, params);
  } else if (analyticsAllowed && typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
};

export const trackLeadGeneration = (
  resource: string,
  source: string,
  value: number = 50
) => {
  trackEvent('generate_lead', {
    currency: 'USD',
    value,
    resource,
    source,
  });
};

export const trackAuditBooking = (value: number = 200) => {
  trackEvent('schedule_audit', {
    currency: 'USD',
    value,
  });
};

export const trackTestimonialInteraction = (action: string, index: number) => {
  trackEvent('testimonial_interaction', {
    action,
    testimonial_index: index,
  });
};

export const trackProblemSectionClick = (destination: string) => {
  trackEvent('problem_section_click', {
    destination,
  });
};
