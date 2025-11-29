import { useState, useEffect } from "react";

/**
 * SSR-safe hook for matching media queries.
 * @param query - CSS media query string (e.g., "(min-width: 1024px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe: start with false, hydrate in effect
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Set initial value
    setMatches(mql.matches);
    
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

