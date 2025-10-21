import { createContext, useContext, useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultBrightness?: number; // 0-100, where 0 is darkest, 100 is lightest
};

type ThemeProviderState = {
  brightness: number;
  setBrightness: (brightness: number) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultBrightness = 35, // Default to a mixed mode, slightly darker
}: ThemeProviderProps) {
  const [brightness, setBrightness] = useState<number>(() => {
    const stored = localStorage.getItem("theme-brightness");
    return stored ? parseInt(stored, 10) : defaultBrightness;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Determine if we're closer to light or dark for base class
    // This maintains compatibility with existing .dark class styles
    if (brightness > 65) {
      root.classList.remove("dark");
      root.classList.add("light");
    } else if (brightness < 35) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      // In the middle range, use dark as base but we'll interpolate
      root.classList.remove("light");
      root.classList.add("dark");
    }
    
    // Set CSS variable for fine-grained control
    root.style.setProperty("--theme-brightness", brightness.toString());
    
    // Calculate interpolation factor (0 = full dark, 1 = full light)
    const interpolation = brightness / 100;
    root.style.setProperty("--theme-interpolation", interpolation.toString());
    
    localStorage.setItem("theme-brightness", brightness.toString());
  }, [brightness]);

  return (
    <ThemeProviderContext.Provider value={{ brightness, setBrightness }}>
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
