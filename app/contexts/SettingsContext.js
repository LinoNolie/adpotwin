import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config';

const SettingsContext = createContext({});

const defaultSettings = {
  theme: APP_CONFIG.APP_SETTINGS.THEME,
  notifications: APP_CONFIG.APP_SETTINGS.NOTIFICATION_ENABLED,
  animations: APP_CONFIG.APP_SETTINGS.ANIMATION_ENABLED,
  autoCashout: APP_CONFIG.APP_SETTINGS.AUTO_CASHOUT_ENABLED,
  autoCashoutMultiplier: 2.0,
  language: 'en',
  currency: APP_CONFIG.APP_SETTINGS.DEFAULT_CURRENCY,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('appSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem('appSettings');
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSetting,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);