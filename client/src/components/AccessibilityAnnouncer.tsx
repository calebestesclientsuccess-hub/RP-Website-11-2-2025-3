
import { useEffect, useRef } from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
}

export function AccessibilityAnnouncer({ 
  message, 
  priority = 'polite',
  clearDelay = 5000 
}: AccessibilityAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      // Clear existing content
      announcerRef.current.textContent = '';
      
      // Force a reflow to ensure screen readers pick up the change
      void announcerRef.current.offsetHeight;
      
      // Set new message
      announcerRef.current.textContent = message;

      // Auto-clear after delay
      if (clearDelay > 0) {
        const timeout = setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = '';
          }
        }, clearDelay);

        return () => clearTimeout(timeout);
      }
    }
  }, [message, clearDelay]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Hook for easier announcements
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) {
      // Create announcer if it doesn't exist
      announcerRef.current = document.createElement('div');
      announcerRef.current.setAttribute('role', 'status');
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.setAttribute('aria-atomic', 'true');
      announcerRef.current.className = 'sr-only';
      document.body.appendChild(announcerRef.current);
    }

    // Clear and set new message
    announcerRef.current.textContent = '';
    void announcerRef.current.offsetHeight;
    announcerRef.current.textContent = message;

    // Auto-clear after 5 seconds
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  return { announce };
}
