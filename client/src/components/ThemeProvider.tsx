import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or use default
    const stored = localStorage.getItem("theme") as Theme;
    const initialTheme = stored || defaultTheme;
    
    // Apply theme immediately during initialization (before first render)
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
    
    return initialTheme;
  });

  // Enhanced theme toggle with smooth transitions
  const setTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // If it's the same theme, do nothing
    if (newTheme === theme) return;
    
    // Add transition class
    root.classList.add('theme-transitioning');
    
    // After transition, switch theme
    setTimeout(() => {
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      localStorage.setItem("theme", newTheme);
      setThemeState(newTheme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 400);
    }, 200);
  };

  // Persist theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = { theme, setTheme };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    console.error("ThemeProvider context is undefined. Provider may not be wrapping component tree properly.");
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};