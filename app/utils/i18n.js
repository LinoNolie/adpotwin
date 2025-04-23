import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      username: 'Username',
    },
    game: {
      bet: 'Place Bet',
      cashout: 'Cash Out',
      multiplier: 'Multiplier',
      amount: 'Amount',
      pot: 'Pot',
      players: 'Players',
      wins: 'Wins',
      losses: 'Losses',
    },
    settings: {
      title: 'Settings',
      sound: 'Sound',
      vibration: 'Vibration',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      autoCashout: 'Auto Cashout',
      darkMode: 'Dark Mode',
    },
    errors: {
      invalidAmount: 'Invalid amount',
      insufficientFunds: 'Insufficient funds',
      networkError: 'Network error',
      serverError: 'Server error',
    },
  },
  es: {
    // Spanish translations
  },
  // Add more languages as needed
};

const i18n = new I18n(translations);

// Get device locale for initial setup
const locale = RNLocalize.getLocales()[0].languageCode;
i18n.locale = locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const setLanguage = async (language) => {
  try {
    await AsyncStorage.setItem('userLanguage', language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

export const getCurrentLanguage = () => i18n.locale;

export const t = (key, options = {}) => i18n.t(key, options);

export const getSupportedLanguages = () => Object.keys(translations);

// Listen for device locale changes
RNLocalize.addEventListener('change', () => {
  const newLocale = RNLocalize.getLocales()[0].languageCode;
  if (getSupportedLanguages().includes(newLocale)) {
    i18n.locale = newLocale;
  }
});