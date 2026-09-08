export type TextDirection = 'ltr' | 'rtl';

export interface LanguageDefinition {
  id: string;
  locale: string;
  nativeName: string;
  englishName: string;
  direction: TextDirection;
  enabled: boolean;
}

export type TranslationResource = Record<string, string>;

export type Translations = Record<string, TranslationResource>;
