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
      escapeValue: false
    },
    resources: {
      en: {
        translation: {
          login: "Login",
          register: "Register",
          guest: "Continue as Guest"
        }
      },
      de: {
        translation: {
          login: "Anmelden",
          register: "Registrieren", 
          guest: "Als Gast fortfahren"
        }
      },
      fr: {
        translation: {
          login: "Se connecter",
          register: "S'inscrire",
          guest: "Continuer en tant qu'invité"  
        }
      }
    }
  });

export default i18n;
