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

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

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

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};