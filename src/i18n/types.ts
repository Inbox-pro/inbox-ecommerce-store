export type Language = 'en' | 'de' | 'nl';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'ENG', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de', label: 'GER', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'nl', label: 'DUT', flag: '🇳🇱', nativeName: 'Nederlands' },
];

export type TranslationDictionary = Record<string, string>;
