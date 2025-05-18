import './i18n';  // This must be the first import
import './i18n/config';  // Add this import at the very top
import './i18n/i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import './components/navbar.css' // Make sure this is imported

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpBackend)
  .init({
    fallbackLng: 'en',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
