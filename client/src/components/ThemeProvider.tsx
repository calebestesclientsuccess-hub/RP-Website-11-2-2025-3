import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

// Performance detection without deprecated APIs
function detectPerformanceTier(): number {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4; // Safari defaults to 4
  const connection = (navigator as any).connection?.effectiveType || '4g';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Simplified tier logic
  if (cores < 4 || memory < 4 || connection === '2g' || connection === 'slow-2g') {
    return 1; // Basic tier
  } else if (cores < 6 || memory < 8 || isMobile) {
    return 2; // Enhanced tier
  }
  return 3; // Full effects tier
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

  // Performance detection on mount
  useEffect(() => {
    const tier = detectPerformanceTier();
    // Add to html element, not body, so CSS selectors work
    document.documentElement.classList.add(`performance-tier-${tier}`);
    
    // Also set CSS variable for additional control
    document.documentElement.style.setProperty('--performance-tier', tier.toString());
    
    // Log for debugging
    console.log(`Performance tier detected: ${tier}`);
  }, []);

  // Enhanced theme toggle with smooth transitions
  const setTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // If it's the same theme, do nothing
    if (newTheme === theme) return;
    
    // Add transition class
    root.classList.add('theme-transitioning');
    
    // Fade out gradient meshes
    const gradientMeshes = document.querySelectorAll('.gradient-mesh-layer, .gradient-mesh-layer-secondary');
    gradientMeshes.forEach((el: Element) => {
      (el as HTMLElement).style.opacity = '0';
    });
    
    // After fade out, switch theme
    setTimeout(() => {
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      localStorage.setItem("theme", newTheme);
      setThemeState(newTheme);
      
      // Fade in new gradients
      setTimeout(() => {
        gradientMeshes.forEach((el: Element) => {
          (el as HTMLElement).style.opacity = '';
        });
        
        // Remove transition class after animation completes
        setTimeout(() => {
          root.classList.remove('theme-transitioning');
        }, 400);
      }, 50);
    }, 200);
  };

  // Initial theme setup (no transition)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
