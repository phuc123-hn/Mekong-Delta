'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * i18n Configuration for Delta Stress Lens
 * - Auto-detects language from localStorage or navigator
 * - Defaults to Vietnamese (vi)
 * - Supports: Vietnamese (vi), English (en)
 */

// Import translation files
import viSidebar from '@/locales/vi/sidebar.json';
import enSidebar from '@/locales/en/sidebar.json';
import viCommon from '@/locales/vi/common.json';
import enCommon from '@/locales/en/common.json';

const resources = {
  vi: {
    sidebar: viSidebar,
    common: viCommon,
  },
  en: {
    sidebar: enSidebar,
    common: enCommon,
  },
};

i18n
  .use(LanguageDetector) // Auto-detect language
  .use(initReactI18next) // Initialize with React
  .init({
    resources, // Use imported JSON files
    fallbackLng: 'vi', // Default: Vietnamese
    debug: false,
    interpolation: {
      escapeValue: false, // React handles XSS protection
    },
    ns: ['sidebar', 'common'], // Available namespaces
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first
      caches: ['localStorage'], // Cache choice in localStorage
    },
  });

export default i18n;
