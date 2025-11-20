import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";

interface ShortcutRegistryContextValue {
  shortcuts: KeyboardShortcut[];
  registerShortcuts: (id: string, shortcuts: KeyboardShortcut[]) => void;
  unregisterShortcuts: (id: string) => void;
}

const ShortcutRegistryContext = createContext<ShortcutRegistryContextValue | undefined>(undefined);

export function ShortcutRegistryProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, KeyboardShortcut[]>>({});

  const registerShortcuts = useCallback((id: string, shortcuts: KeyboardShortcut[]) => {
    setRegistry((prev) => ({ ...prev, [id]: shortcuts }));
  }, []);

  const unregisterShortcuts = useCallback((id: string) => {
    setRegistry((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const shortcuts = useMemo(() => Object.values(registry).flat(), [registry]);

  const value = useMemo(
    () => ({ shortcuts, registerShortcuts, unregisterShortcuts }),
    [shortcuts, registerShortcuts, unregisterShortcuts]
  );

  return (
    <ShortcutRegistryContext.Provider value={value}>
      {children}
    </ShortcutRegistryContext.Provider>
  );
}

export function useShortcutRegistry() {
  const context = useContext(ShortcutRegistryContext);
  if (!context) {
    throw new Error("useShortcutRegistry must be used within a ShortcutRegistryProvider");
  }
  return context;
}


