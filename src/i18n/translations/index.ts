import { Language, TranslationDictionary } from '../types';
import { en } from './en';
import { de } from './de';
import { nl } from './nl';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  de,
  nl,
};

export { en, de, nl };
