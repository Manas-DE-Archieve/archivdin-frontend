import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ru from './i18n/locales/ru/translation.json'
import ky from './i18n/locales/ky/translation.json'
import en from './i18n/locales/en/translation.json'

const resources = {
  ru: { translation: ru },
  ky: { translation: ky },
  en: { translation: en }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n