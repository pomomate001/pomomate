/**
 * Theme context & provider.
 *
 * Provides the active theme to the entire component tree and exposes
 * a `setThemeId` function to switch themes at runtime.
 */
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { themes, darkTheme } from './themes';
import type { AppTheme } from './themes';
import { useSettingsStore } from '../../state';

interface ThemeContextValue {
  theme: AppTheme;
  setThemeId: (id: string) => void;
  availableThemes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  setThemeId: () => {},
  availableThemes: [darkTheme],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useSettingsStore((s) => s.themeId);
  const saveThemeId = useSettingsStore((s) => s.setThemeId);

  const theme = useMemo(() => themes.get(themeId) ?? darkTheme, [themeId]);

  const setThemeId = useCallback((id: string) => {
    if (themes.has(id)) {
      saveThemeId(id); // Persist to store immediately
    }
  }, [saveThemeId]);

  const availableThemes = useMemo(() => Array.from(themes.values()), []);

  const value = useMemo(
    () => ({ theme, setThemeId, availableThemes }),
    [theme, setThemeId, availableThemes],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook — access the active theme anywhere. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Shorthand — returns just the color tokens. */
export function useColors() {
  return useContext(ThemeContext).theme.colors;
}
