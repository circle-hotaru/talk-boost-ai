import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslation from './locales/en.json'
import zhTranslation from './locales/zh.json'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: enTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['navigator', 'htmlTag'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
