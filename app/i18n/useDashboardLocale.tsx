'use client';

import { useLocale } from './LocaleContext';
import { dashboardTranslations, DashboardTranslationKeys } from './index';

export function useDashboardLocale() {
  const { locale, setLocale } = useLocale();
  
  return {
    locale,
    setLocale,
    t: dashboardTranslations[locale] as DashboardTranslationKeys,
  };
}
