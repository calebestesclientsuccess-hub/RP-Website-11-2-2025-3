declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
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
