import type { Translations, TranslationResource } from './types';
import { en } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { de } from './translations/de';
import { pt } from './translations/pt';
import { ar } from './translations/ar';
import { ja } from './translations/ja';
import { sw } from './translations/sw';

export const translationResources: Record<string, TranslationResource> = {
  en,
  es,
  fr,
  de,
  pt,
  ar,
  ja,
  sw,
};

export function getTranslations(langId: string): Translations {
  const target = translationResources[langId];
  const fallback = en;
  return { target: target ?? fallback, fallback };
}

export function translate(
  key: string,
  langId: string,
  params?: Record<string, string | number>
): string {
  const { target, fallback } = getTranslations(langId);

  let value = target[key];
  if (value == null) {
    value = fallback[key];
  }
  if (value == null) {
    return key;
  }

  if (params) {
    for (const [param, replacement] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement));
    }
  }

  return value;
}
