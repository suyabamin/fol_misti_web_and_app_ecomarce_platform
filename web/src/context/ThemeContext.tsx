import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, AppearanceSettings } from '../models';
import { settingsRepository, VALID_THEMES } from '../repositories/settingsRepository';

interface ThemeContextType {
  activeTheme: ThemeId;
  themeSettings: AppearanceSettings | null;
  loading: boolean;
  publishTheme: (themeId: ThemeId, adminUid: string) => Promise<void>;
  previewTheme: (themeId: ThemeId) => void;
  resetPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>('default');
  const [previewingTheme, setPreviewingTheme] = useState<ThemeId | null>(null);
  const [themeSettings, setThemeSettings] = useState<AppearanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize theme
  useEffect(() => {
    async function loadTheme() {
      try {
        const settings = await settingsRepository.getAppearanceSettings();
        setThemeSettings(settings);
        setActiveTheme(settings.activeTheme);
        document.documentElement.setAttribute('data-theme', settings.activeTheme);
      } catch (err) {
        console.error('Failed to load active theme:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();

    // Listen to theme changed events across tabs or components
    const handleThemeChange = (e: any) => {
      if (e.detail?.themeId && VALID_THEMES.includes(e.detail.themeId)) {
        setActiveTheme(e.detail.themeId);
        document.documentElement.setAttribute('data-theme', e.detail.themeId);
      }
    };

    window.addEventListener('folmishti_theme_changed', handleThemeChange);
    return () => window.removeEventListener('folmishti_theme_changed', handleThemeChange);
  }, []);

  const publishTheme = async (themeId: ThemeId, adminUid: string) => {
    const updated = await settingsRepository.publishTheme(themeId, adminUid);
    setThemeSettings(updated);
    setActiveTheme(themeId);
    setPreviewingTheme(null);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const previewTheme = (themeId: ThemeId) => {
    if (VALID_THEMES.includes(themeId)) {
      setPreviewingTheme(themeId);
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  const resetPreview = () => {
    setPreviewingTheme(null);
    document.documentElement.setAttribute('data-theme', activeTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        activeTheme: previewingTheme || activeTheme,
        themeSettings,
        loading,
        publishTheme,
        previewTheme,
        resetPreview
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
