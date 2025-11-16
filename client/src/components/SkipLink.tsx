
import { useEffect, useState } from 'react';

/**
 * Skip navigation link for keyboard users
 * WCAG 2.1 Success Criterion 2.4.1 (Level A)
 */
export function SkipLink() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#000',
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        zIndex: 100,
        ...(isVisible && {
          top: 0,
        }),
      }}
    >
      Skip to main content
    </a>
  );
}
