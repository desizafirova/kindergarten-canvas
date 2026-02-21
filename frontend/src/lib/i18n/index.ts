import { bg } from './bg';
import type { Translations } from './types';

/**
 * The active translations object.
 * Currently configured for Bulgarian (bg).
 */
export const translations = bg;

/**
 * Hook for accessing translations in React components.
 * Provides type-safe access to all translation keys.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const t = useTranslation();
 *   return <button>{t.buttons.save}</button>;
 * }
 * ```
 */
export function useTranslation(): Translations {
  return translations;
}

/**
 * Direct accessor for translations (for use outside React components).
 * Convenient shorthand for accessing translations in utility functions.
 *
 * @example
 * ```ts
 * import { t } from '@/lib/i18n';
 * console.log(t.errors.required);
 * ```
 */
export const t = translations;

// Re-export types for external use
export type { Translations, TranslationKey } from './types';
