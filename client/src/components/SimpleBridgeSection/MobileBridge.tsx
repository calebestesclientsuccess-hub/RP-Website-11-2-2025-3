/**
 * MobileBridge - Simple, Performant Mobile Experience
 * 
 * Philosophy: No GSAP, no scroll hijacking, no complex animations
 * Just clean content reveal using IntersectionObserver + CSS
 * 
 * Stack layout:
 * 1. White text: "You need more than just another salesperson."
 * 2. Red text: "You need a system." (fades in on scroll)
 */

import { useEffect, useRef, useState } from 'react';
import { STANDARD_GLOW_STYLE } from './shared/constants';

/**
 * Simple utility component for fade-in on scroll
 */
function IntersectionFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={ref}
      className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}

/**
 * MobileBridge Component
 */
export default function MobileBridge() {
  return (
    <section 
      className="relative bg-zinc-950"
      data-testid="mobile-bridge"
    >
      {/* White Text Section */}
      <div className="flex items-center justify-center min-h-screen py-16 px-6">
        <p className="text-2xl text-white font-semibold leading-relaxed text-center max-w-xl">
          You need more<br />
          than just<br />
          another salesperson.
        </p>
      </div>
      
      {/* Red Text Section - Fades in on scroll */}
      <div className="flex items-center justify-center min-h-screen py-16 px-6">
        <IntersectionFade>
          <h2 
            className="text-5xl font-black text-center leading-tight" 
            style={STANDARD_GLOW_STYLE}
          >
            You need a<br />system.
          </h2>
        </IntersectionFade>
      </div>
    </section>
  );
}

