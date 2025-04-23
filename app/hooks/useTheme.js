import { useState, useEffect, useCallback } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../utils/analytics';

const themes = {
  light: {
    colors: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      background: '#ffffff',
      surface: '#f3f4f6',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32
      },
      body: {
        fontSize: 16,
        lineHeight: 24
      },
      caption: {
        fontSize: 14,
        lineHeight: 20
      }
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8
      }
    }
  },
  dark: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24'
    },
    // Other properties remain the same as light theme
    spacing: { ...themes.light.spacing },
    borderRadius: { ...themes.light.borderRadius },
    typography: { ...themes.light.typography },
    shadows: { ...themes.light.shadows }
  }
};

export function useTheme() {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (mode) => {
    try {
      await AsyncStorage.setItem('theme_mode', mode);
      setThemeMode(mode);
      
      analytics.trackEvent('theme_changed', {
        mode,
        previous: themeMode
      });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  }, [themeMode, setTheme]);

  const resetToSystemTheme = useCallback(() => {
    setTheme(systemTheme);
  }, [systemTheme, setTheme]);

  return {
    theme: themes[themeMode],
    themeMode,
    setTheme,
    toggleTheme,
    resetToSystemTheme,
    isLoading
  };
}