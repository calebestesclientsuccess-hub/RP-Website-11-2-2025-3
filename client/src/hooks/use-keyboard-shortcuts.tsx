
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        const metaMatch = !!shortcut.metaKey === event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress, enabled]);
}

// Global keyboard shortcuts help modal
export const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: '/',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector('[role="search"] input') as HTMLInputElement;
      searchInput?.focus();
    },
    category: 'Navigation',
  },
  {
    key: 'h',
    description: 'Go to home page',
    action: () => window.location.href = '/',
    category: 'Navigation',
  },
  {
    key: '?',
    shiftKey: true,
    description: 'Show keyboard shortcuts',
    action: () => {
      // This will be implemented when the modal is created
      console.log('Keyboard shortcuts modal');
    },
    category: 'Help',
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog',
    action: () => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement;
      closeButton?.click();
    },
    category: 'Navigation',
  },
];

export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('Cmd');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}
