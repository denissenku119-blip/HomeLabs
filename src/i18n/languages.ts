import type { LanguageDefinition } from './types';

export const LANGUAGES: LanguageDefinition[] = [
  { id: 'en', locale: 'en-US', nativeName: 'English', englishName: 'English', direction: 'ltr', enabled: true },
  { id: 'es', locale: 'es-ES', nativeName: 'Español', englishName: 'Spanish', direction: 'ltr', enabled: true },
  { id: 'fr', locale: 'fr-FR', nativeName: 'Français', englishName: 'French', direction: 'ltr', enabled: true },
  { id: 'de', locale: 'de-DE', nativeName: 'Deutsch', englishName: 'German', direction: 'ltr', enabled: true },
  { id: 'pt', locale: 'pt-BR', nativeName: 'Português', englishName: 'Portuguese', direction: 'ltr', enabled: true },
  { id: 'it', locale: 'it-IT', nativeName: 'Italiano', englishName: 'Italian', direction: 'ltr', enabled: true },
  { id: 'nl', locale: 'nl-NL', nativeName: 'Nederlands', englishName: 'Dutch', direction: 'ltr', enabled: true },
  { id: 'pl', locale: 'pl-PL', nativeName: 'Polski', englishName: 'Polish', direction: 'ltr', enabled: true },
  { id: 'uk', locale: 'uk-UA', nativeName: 'Українська', englishName: 'Ukrainian', direction: 'ltr', enabled: true },
  { id: 'ru', locale: 'ru-RU', nativeName: 'Русский', englishName: 'Russian', direction: 'ltr', enabled: true },
  { id: 'tr', locale: 'tr-TR', nativeName: 'Türkçe', englishName: 'Turkish', direction: 'ltr', enabled: true },
  { id: 'ar', locale: 'ar', nativeName: 'العربية', englishName: 'Arabic', direction: 'rtl', enabled: true },
  { id: 'he', locale: 'he-IL', nativeName: 'עברית', englishName: 'Hebrew', direction: 'rtl', enabled: true },
  { id: 'fa', locale: 'fa-IR', nativeName: 'فارسی', englishName: 'Persian', direction: 'rtl', enabled: true },
  { id: 'hi', locale: 'hi-IN', nativeName: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', enabled: true },
  { id: 'bn', locale: 'bn-BD', nativeName: 'বাংলা', englishName: 'Bengali', direction: 'ltr', enabled: true },
  { id: 'ur', locale: 'ur-PK', nativeName: 'اردو', englishName: 'Urdu', direction: 'rtl', enabled: true },
  { id: 'pa', locale: 'pa-IN', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr', enabled: true },
  { id: 'gu', locale: 'gu-IN', nativeName: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr', enabled: true },
  { id: 'mr', locale: 'mr-IN', nativeName: 'मराठी', englishName: 'Marathi', direction: 'ltr', enabled: true },
  { id: 'ta', locale: 'ta-IN', nativeName: 'தமிழ்', englishName: 'Tamil', direction: 'ltr', enabled: true },
  { id: 'te', locale: 'te-IN', nativeName: 'తెలుగు', englishName: 'Telugu', direction: 'ltr', enabled: true },
  { id: 'kn', locale: 'kn-IN', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr', enabled: true },
  { id: 'ml', locale: 'ml-IN', nativeName: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr', enabled: true },
  { id: 'id', locale: 'id-ID', nativeName: 'Indonesia', englishName: 'Indonesian', direction: 'ltr', enabled: true },
  { id: 'ms', locale: 'ms-MY', nativeName: 'Melayu', englishName: 'Malay', direction: 'ltr', enabled: true },
  { id: 'vi', locale: 'vi-VN', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', direction: 'ltr', enabled: true },
  { id: 'th', locale: 'th-TH', nativeName: 'ไทย', englishName: 'Thai', direction: 'ltr', enabled: true },
  { id: 'fil', locale: 'fil-PH', nativeName: 'Filipino', englishName: 'Filipino', direction: 'ltr', enabled: true },
  { id: 'zh-Hans', locale: 'zh-CN', nativeName: '简体中文', englishName: 'Simplified Chinese', direction: 'ltr', enabled: true },
  { id: 'zh-Hant', locale: 'zh-TW', nativeName: '繁體中文', englishName: 'Traditional Chinese', direction: 'ltr', enabled: true },
  { id: 'ja', locale: 'ja-JP', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr', enabled: true },
  { id: 'ko', locale: 'ko-KR', nativeName: '한국어', englishName: 'Korean', direction: 'ltr', enabled: true },
  { id: 'sw', locale: 'sw-KE', nativeName: 'Kiswahili', englishName: 'Swahili', direction: 'ltr', enabled: true },
  { id: 'am', locale: 'am-ET', nativeName: 'አማርኛ', englishName: 'Amharic', direction: 'ltr', enabled: true },
  { id: 'ha', locale: 'ha-NG', nativeName: 'Hausa', englishName: 'Hausa', direction: 'ltr', enabled: true },
  { id: 'yo', locale: 'yo-NG', nativeName: 'Yorùbá', englishName: 'Yoruba', direction: 'ltr', enabled: true },
  { id: 'ig', locale: 'ig-NG', nativeName: 'Igbo', englishName: 'Igbo', direction: 'ltr', enabled: true },
  { id: 'zu', locale: 'zu-ZA', nativeName: 'isiZulu', englishName: 'Zulu', direction: 'ltr', enabled: true },
  { id: 'xh', locale: 'xh-ZA', nativeName: 'isiXhosa', englishName: 'Xhosa', direction: 'ltr', enabled: true },
];

export const LANGUAGE_MAP = new Map(LANGUAGES.map((l) => [l.id, l]));

export function getLanguage(id: string): LanguageDefinition | undefined {
  return LANGUAGE_MAP.get(id);
}

export function getDefaultLanguage(): LanguageDefinition {
  return LANGUAGES[0];
}

export function isRTL(id: string): boolean {
  return LANGUAGE_MAP.get(id)?.direction === 'rtl';
}
