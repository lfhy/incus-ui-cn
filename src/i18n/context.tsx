import type { FC, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Locale,
  type MessageKey,
  type TranslationParams,
  translateMessage,
} from "./messages";

const LOCALE_STORAGE_KEY = "incusUiLocale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

  if (storedLocale && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  return DEFAULT_LOCALE;
};

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale,
      t: (key: MessageKey, params?: TranslationParams) =>
        translateMessage(locale, key, params),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
};
