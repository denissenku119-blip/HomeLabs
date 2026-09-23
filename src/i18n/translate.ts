import type { Translations, TranslationResource } from './types';
import { en } from './translations/en';
import { allTranslations } from './translations';

export const translationResources: Record<string, TranslationResource> = allTranslations;

const englishKeyByValue = new Map<string, string>();
for (const [key, value] of Object.entries(en)) {
  if (!englishKeyByValue.has(value)) englishKeyByValue.set(value, key);
}

const templateMatchers = Object.entries(en)
  .filter(([, value]) => /\{\w+\}/.test(value))
  .map(([key, value]) => {
    const params: string[] = [];
    const escaped = value
      .split(/(\{\w+\})/g)
      .map((part) => {
        const match = part.match(/^\{(\w+)\}$/);
        if (match) {
          params.push(match[1]);
          return '(.+?)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('');
    return { key, params, regex: new RegExp(`^${escaped}$`) };
  });

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

/** Localizes legacy presentation copy at the render boundary without changing stored data. */
export function translateVisibleText(value: string, langId: string): string {
  if (langId === 'en' || !value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const normalized = value.trim().replace(/\s+/g, ' ');
  const exactKey = englishKeyByValue.get(normalized);
  if (exactKey) return `${leading}${translate(exactKey, langId)}${trailing}`;

  for (const matcher of templateMatchers) {
    const match = normalized.match(matcher.regex);
    if (!match) continue;
    const params: Record<string, string> = {};
    matcher.params.forEach((param, index) => {
      params[param] = match[index + 1];
    });
    return `${leading}${translate(matcher.key, langId, params)}${trailing}`;
  }
  return value;
}
