import {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
  type ReactNode,
} from 'react';
import type { TextDirection } from './types';
import { LANGUAGES, getLanguage, getDefaultLanguage, isRTL } from './languages';
import { translate } from './translate';

const STORAGE_KEY = 'homelab-architect:language';
const ONBOARDING_KEY = 'homelab-architect:language-onboarded';

interface I18nContextValue {
  langId: string;
  direction: TextDirection;
  isRTL: boolean;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (langId: string) => void;
  hasOnboarded: boolean;
  completeOnboarding: (langId: string) => void;
  availableLanguages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function loadStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && getLanguage(stored)) return stored;
  } catch {
    // fail silently
  }
  return getDefaultLanguage().id;
}

function loadOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [langId, setLangIdState] = useState<string>(loadStoredLanguage);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(loadOnboarded);

  const lang = getLanguage(langId) ?? getDefaultLanguage();
  const direction = lang.direction;
  const rtl = isRTL(langId);

  useEffect(() => {
    document.documentElement.lang = lang.locale;
    document.documentElement.dir = direction;
  }, [lang.locale, direction]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, langId, params),
    [langId]
  );

  const setLanguage = useCallback((id: string) => {
    if (!getLanguage(id)) return;
    setLangIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // fail silently
    }
  }, []);

  const completeOnboarding = useCallback((id: string) => {
    if (!getLanguage(id)) return;
    setLangIdState(id);
    setHasOnboarded(true);
    try {
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // fail silently
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    langId,
    direction,
    isRTL: rtl,
    locale: lang.locale,
    t,
    setLanguage,
    hasOnboarded,
    completeOnboarding,
    availableLanguages: LANGUAGES,
  }), [langId, direction, rtl, lang.locale, t, setLanguage, hasOnboarded, completeOnboarding]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
