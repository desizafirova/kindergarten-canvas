import { describe, it, expect } from 'vitest';
import { translations, useTranslation, t } from '@/lib/i18n';
import type { Translations } from '@/lib/i18n';

describe('Bulgarian Translation System', () => {
  describe('translations object', () => {
    it('should export all required navigation labels', () => {
      expect(translations.nav.dashboard).toBe('Табло');
      expect(translations.nav.news).toBe('Новини');
      expect(translations.nav.careers).toBe('Кариери');
      expect(translations.nav.gallery).toBe('Галерия');
      expect(translations.nav.teachers).toBe('Учители');
      expect(translations.nav.events).toBe('Събития');
      expect(translations.nav.deadlines).toBe('Срокове');
      expect(translations.nav.settings).toBe('Настройки');
      expect(translations.nav.logout).toBe('Изход');
    });

    it('should export all required button labels', () => {
      expect(translations.buttons.create).toBe('Създай');
      expect(translations.buttons.edit).toBe('Редактирай');
      expect(translations.buttons.delete).toBe('Изтрий');
      expect(translations.buttons.save).toBe('Запази');
      expect(translations.buttons.publish).toBe('Публикувай');
      expect(translations.buttons.cancel).toBe('Отказ');
      expect(translations.buttons.close).toBe('Затвори');
      expect(translations.buttons.login).toBe('Вход');
      expect(translations.buttons.help).toBe('Помощ');
    });

    it('should export all required status labels', () => {
      expect(translations.status.draft).toBe('Чернова');
      expect(translations.status.published).toBe('Публикуван');
    });

    it('should export all required common UI text', () => {
      expect(translations.common.search).toBe('Търси');
      expect(translations.common.loading).toBe('Зареждане...');
      expect(translations.common.noResults).toBe('Няма резултати');
      expect(translations.common.confirm).toBe('Потвърди');
      expect(translations.common.welcome).toBe('Добре дошли');
      expect(translations.common.welcomeToAdminPanel).toBe('Добре дошли в администраторския панел');
      expect(translations.common.manageContent).toBe('Управлявайте съдържанието на вашия уебсайт от тук.');
      expect(translations.common.temporaryPage).toBeDefined();
    });

    it('should export all required error messages', () => {
      expect(translations.errors.invalidCredentials).toBe('Невалиден имейл или парола');
      expect(translations.errors.sessionExpired).toBe('Сесията е изтекла. Моля, влезте отново.');
      expect(translations.errors.rateLimited).toBe('Твърде много опити. Опитайте отново след 15 минути.');
      expect(translations.errors.required).toBe('Това поле е задължително');
      expect(translations.errors.invalidEmail).toBe('Невалиден имейл адрес');
      expect(translations.errors.networkError).toBe('Грешка при свързване със сървъра');
      expect(translations.errors.unauthorized).toBe('Неоторизиран достъп');
      expect(translations.errors.emailRequired).toBe('Имейлът е задължителен');
      expect(translations.errors.passwordRequired).toBe('Паролата е задължителна');
      expect(translations.errors.passwordMinLength).toBe('Паролата трябва да е поне 6 символа');
    });

    it('should export all required success messages', () => {
      expect(translations.success.saved).toBe('Успешно запазено');
      expect(translations.success.published).toBe('Успешно публикувано');
      expect(translations.success.deleted).toBe('Успешно изтрито');
      expect(translations.success.loggedIn).toBe('Успешен вход');
      expect(translations.success.loggedOut).toBe('Успешен изход');
    });

    it('should export all content types with titles and icons', () => {
      expect(translations.contentTypes.news).toEqual({ title: 'Новини', icon: '📰' });
      expect(translations.contentTypes.careers).toEqual({ title: 'Кариери', icon: '💼' });
      expect(translations.contentTypes.events).toEqual({ title: 'Събития', icon: '📅' });
      expect(translations.contentTypes.deadlines).toEqual({ title: 'Срокове', icon: '⏰' });
      expect(translations.contentTypes.gallery).toEqual({ title: 'Галерия', icon: '🖼️' });
      expect(translations.contentTypes.teachers).toEqual({ title: 'Учители', icon: '👨‍🏫' });
    });

    it('should export all auth-related translations', () => {
      expect(translations.auth.pageTitle).toBe('Вход в администраторския панел');
      expect(translations.auth.pageDescription).toBe('Въведете вашите данни за достъп');
      expect(translations.auth.emailLabel).toBe('Имейл');
      expect(translations.auth.emailPlaceholder).toBe('вашият@имейл.бг');
      expect(translations.auth.passwordLabel).toBe('Парола');
      expect(translations.auth.passwordPlaceholder).toBe('••••••••');
      expect(translations.auth.loggingIn).toBe('Влизане...');
    });
  });

  describe('useTranslation hook', () => {
    it('should return the translations object', () => {
      const result = useTranslation();
      expect(result).toBe(translations);
    });

    it('should provide type-safe access to translation keys', () => {
      const result: Translations = useTranslation();
      // TypeScript would error if these keys didn't exist
      expect(result.nav.dashboard).toBeDefined();
      expect(result.buttons.save).toBeDefined();
      expect(result.errors.required).toBeDefined();
    });
  });

  describe('t shorthand accessor', () => {
    it('should be the same as translations object', () => {
      expect(t).toBe(translations);
    });

    it('should provide direct access to translation keys', () => {
      expect(t.nav.dashboard).toBe('Табло');
      expect(t.buttons.login).toBe('Вход');
      expect(t.errors.invalidCredentials).toBe('Невалиден имейл или парола');
    });
  });

  describe('translation completeness', () => {
    it('should have all navigation keys defined', () => {
      const navKeys = Object.keys(translations.nav);
      expect(navKeys).toContain('dashboard');
      expect(navKeys).toContain('news');
      expect(navKeys).toContain('careers');
      expect(navKeys).toContain('gallery');
      expect(navKeys).toContain('teachers');
      expect(navKeys).toContain('events');
      expect(navKeys).toContain('deadlines');
      expect(navKeys).toContain('settings');
      expect(navKeys).toContain('logout');
    });

    it('should have no empty string values', () => {
      const checkNoEmptyStrings = (obj: Record<string, unknown>, path = ''): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.length, `${currentPath} should not be empty`).toBeGreaterThan(0);
          } else if (typeof value === 'object' && value !== null) {
            checkNoEmptyStrings(value as Record<string, unknown>, currentPath);
          }
        }
      };
      checkNoEmptyStrings(translations as unknown as Record<string, unknown>);
    });
  });
});
