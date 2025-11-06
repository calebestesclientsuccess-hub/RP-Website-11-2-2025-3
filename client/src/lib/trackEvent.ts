export async function trackEvent(
  eventType: 'campaign_viewed' | 'campaign_submit' | 'campaign_dismissed',
  campaignId: string,
  payload?: Record<string, any>
) {
  try {
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        eventType,
        payload: payload || {}
      })
    });
  } catch (error) {
    // Fail silently - don't break user experience for analytics
    console.error('Failed to track event:', error);
  }
}
