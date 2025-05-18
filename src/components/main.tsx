import './i18n/config';  // Add this import at the very top
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import './i18n';  // Add this import at the top

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
