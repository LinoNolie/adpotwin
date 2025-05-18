import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          // English translations
        }
      },
      de: {
        translation: {
          // German translations
        }
      },
      fr: {
        translation: {
          // French translations 
        }
      }
    }
  });

export default i18n;
