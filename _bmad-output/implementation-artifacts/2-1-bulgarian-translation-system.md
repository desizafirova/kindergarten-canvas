# Story 2.1: Bulgarian Translation System

Status: done

## Story

As a **developer**,
I want **a centralized Bulgarian translation system**,
So that **all admin UI text displays in Bulgarian consistently**.

## Acceptance Criteria

1. **AC1: Translation File Structure**
   - Given the frontend requires Bulgarian text throughout
   - When the translation system is implemented
   - Then a `src/lib/i18n/bg.ts` file exports a typed translations object containing:
     - Navigation labels (Табло, Новини, Кариери, Галерия, Учители, Събития, Срокове)
     - Button text (Създай, Редактирай, Изтрий, Запази, Публикувай, Отказ)
     - Status labels (Чернова, Публикуван)
     - Common UI text (Търси, Зареждане, Няма резултати)
     - Error messages
     - Success messages

2. **AC2: TypeScript Autocomplete**
   - Given a developer uses the translation system
   - When accessing translation keys
   - Then TypeScript provides autocomplete for all translation keys
   - And type errors occur if an invalid key is used

3. **AC3: Translation Hook/Helper**
   - Given any admin component needs Bulgarian text
   - When using the `useTranslation()` hook or helper function
   - Then it provides access to all translations with type safety

4. **AC4: No English Text in Admin**
   - Given the admin interface is rendered
   - When viewing any admin page
   - Then no English text appears (except technical terms if appropriate)

## Tasks / Subtasks

- [x] **Task 1: Create Translation Types** (AC: 1, 2)
  - [x] 1.1: Create `src/lib/i18n/types.ts` with TypeScript interface for translations structure
  - [x] 1.2: Define nested object structure for categories: nav, buttons, status, common, errors, success
  - [x] 1.3: Export type for translation keys (e.g., `TranslationKey`)

- [x] **Task 2: Create Bulgarian Translations File** (AC: 1, 4)
  - [x] 2.1: Create `src/lib/i18n/bg.ts` implementing the Translations interface
  - [x] 2.2: Add navigation labels:
    - `nav.dashboard` = "Табло"
    - `nav.news` = "Новини"
    - `nav.careers` = "Кариери"
    - `nav.gallery` = "Галерия"
    - `nav.teachers` = "Учители"
    - `nav.events` = "Събития"
    - `nav.deadlines` = "Срокове"
    - `nav.settings` = "Настройки"
    - `nav.logout` = "Изход"
  - [x] 2.3: Add button labels:
    - `buttons.create` = "Създай"
    - `buttons.edit` = "Редактирай"
    - `buttons.delete` = "Изтрий"
    - `buttons.save` = "Запази"
    - `buttons.publish` = "Публикувай"
    - `buttons.cancel` = "Отказ"
    - `buttons.close` = "Затвори"
    - `buttons.login` = "Вход"
    - `buttons.help` = "Помощ"
  - [x] 2.4: Add status labels:
    - `status.draft` = "Чернова"
    - `status.published` = "Публикуван"
  - [x] 2.5: Add common UI text:
    - `common.search` = "Търси"
    - `common.loading` = "Зареждане..."
    - `common.noResults` = "Няма резултати"
    - `common.confirm` = "Потвърди"
    - `common.welcome` = "Добре дошли"
    - `common.contentTypes` (array for dashboard cards)
  - [x] 2.6: Add error messages:
    - `errors.invalidCredentials` = "Невалиден имейл или парола"
    - `errors.sessionExpired` = "Сесията е изтекла. Моля, влезте отново."
    - `errors.rateLimited` = "Твърде много опити. Опитайте отново след 15 минути."
    - `errors.required` = "Това поле е задължително"
    - `errors.invalidEmail` = "Невалиден имейл адрес"
    - `errors.networkError` = "Грешка при свързване със сървъра"
    - `errors.unauthorized` = "Неоторизиран достъп"
  - [x] 2.7: Add success messages:
    - `success.saved` = "Успешно запазено"
    - `success.published` = "Успешно публикувано"
    - `success.deleted` = "Успешно изтрито"
    - `success.loggedIn` = "Успешен вход"
    - `success.loggedOut` = "Успешен изход"

- [x] **Task 3: Create Translation Hook** (AC: 2, 3)
  - [x] 3.1: Create `src/lib/i18n/index.ts` as the main export file
  - [x] 3.2: Create `useTranslation()` hook that returns the translations object
  - [x] 3.3: Export a `t()` helper function for simple key access (optional)
  - [x] 3.4: Ensure TypeScript autocomplete works for all translation keys

- [x] **Task 4: Refactor Existing Components** (AC: 4)
  - [x] 4.1: Update `src/pages/admin/Login.tsx` to use translations instead of hardcoded strings
  - [x] 4.2: Update `src/pages/admin/Dashboard.tsx` to use translations
  - [x] 4.3: Verify no hardcoded Bulgarian or English strings remain in admin components

- [x] **Task 5: Write Tests** (AC: 1, 2, 3)
  - [x] 5.1: Test that all required translation keys exist
  - [x] 5.2: Test that `useTranslation()` hook returns the translations object
  - [x] 5.3: Test TypeScript type checking (compile-time verification)

## Dev Notes

### Architecture Requirements [Source: architecture.md]

**Localization Strategy:**
- Bulgarian language implementation across all UI components
- Date/time formatting (dd.MM.yyyy convention)
- Error message translation and consistency
- Translation file structure and maintenance approach
- Bulgarian keyboard layout support in text editors

**File Location per Architecture:**
```
frontend/src/lib/
├── i18n/
│   ├── types.ts      # TypeScript interfaces for translations
│   ├── bg.ts         # Bulgarian translations
│   └── index.ts      # Main export (hook + translations)
```

**Path Alias:** Use `@/` for imports (e.g., `import { useTranslation } from '@/lib/i18n'`)

### Recommended Implementation Pattern

```typescript
// src/lib/i18n/types.ts
export interface Translations {
  nav: {
    dashboard: string;
    news: string;
    careers: string;
    gallery: string;
    teachers: string;
    events: string;
    deadlines: string;
    settings: string;
    logout: string;
  };
  buttons: {
    create: string;
    edit: string;
    delete: string;
    save: string;
    publish: string;
    cancel: string;
    close: string;
    login: string;
    help: string;
  };
  status: {
    draft: string;
    published: string;
  };
  common: {
    search: string;
    loading: string;
    noResults: string;
    confirm: string;
    welcome: string;
  };
  errors: {
    invalidCredentials: string;
    sessionExpired: string;
    rateLimited: string;
    required: string;
    invalidEmail: string;
    networkError: string;
    unauthorized: string;
  };
  success: {
    saved: string;
    published: string;
    deleted: string;
    loggedIn: string;
    loggedOut: string;
  };
  // Content types for dashboard cards
  contentTypes: {
    news: { title: string; icon: string };
    careers: { title: string; icon: string };
    events: { title: string; icon: string };
    deadlines: { title: string; icon: string };
    gallery: { title: string; icon: string };
    teachers: { title: string; icon: string };
  };
  auth: {
    pageTitle: string;
    emailLabel: string;
    passwordLabel: string;
  };
}
```

```typescript
// src/lib/i18n/bg.ts
import type { Translations } from './types';

export const bg: Translations = {
  nav: {
    dashboard: 'Табло',
    news: 'Новини',
    careers: 'Кариери',
    gallery: 'Галерия',
    teachers: 'Учители',
    events: 'Събития',
    deadlines: 'Срокове',
    settings: 'Настройки',
    logout: 'Изход',
  },
  buttons: {
    create: 'Създай',
    edit: 'Редактирай',
    delete: 'Изтрий',
    save: 'Запази',
    publish: 'Публикувай',
    cancel: 'Отказ',
    close: 'Затвори',
    login: 'Вход',
    help: 'Помощ',
  },
  status: {
    draft: 'Чернова',
    published: 'Публикуван',
  },
  common: {
    search: 'Търси',
    loading: 'Зареждане...',
    noResults: 'Няма резултати',
    confirm: 'Потвърди',
    welcome: 'Добре дошли',
  },
  errors: {
    invalidCredentials: 'Невалиден имейл или парола',
    sessionExpired: 'Сесията е изтекла. Моля, влезте отново.',
    rateLimited: 'Твърде много опити. Опитайте отново след 15 минути.',
    required: 'Това поле е задължително',
    invalidEmail: 'Невалиден имейл адрес',
    networkError: 'Грешка при свързване със сървъра',
    unauthorized: 'Неоторизиран достъп',
  },
  success: {
    saved: 'Успешно запазено',
    published: 'Успешно публикувано',
    deleted: 'Успешно изтрито',
    loggedIn: 'Успешен вход',
    loggedOut: 'Успешен изход',
  },
  contentTypes: {
    news: { title: 'Новини', icon: '📰' },
    careers: { title: 'Кариери', icon: '💼' },
    events: { title: 'Събития', icon: '📅' },
    deadlines: { title: 'Срокове', icon: '⏰' },
    gallery: { title: 'Галерия', icon: '🖼️' },
    teachers: { title: 'Учители', icon: '👨‍🏫' },
  },
  auth: {
    pageTitle: 'Вход в администраторския панел',
    emailLabel: 'Имейл',
    passwordLabel: 'Парола',
  },
};
```

```typescript
// src/lib/i18n/index.ts
import { bg } from './bg';
import type { Translations } from './types';

// Export the translations object directly
export const translations = bg;

// Hook for component usage
export function useTranslation(): Translations {
  return translations;
}

// Simple accessor (optional, for convenience)
export const t = translations;

// Re-export types
export type { Translations } from './types';
```

### Usage Pattern in Components

```tsx
// In any admin component:
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const t = useTranslation();

  return (
    <button>{t.buttons.save}</button>
    <span>{t.status.draft}</span>
  );
}
```

### Existing Hardcoded Strings to Replace

**From Login.tsx (Story 1.6):**
- "Вход в администраторския панел" → `t.auth.pageTitle`
- "Имейл" → `t.auth.emailLabel`
- "Парола" → `t.auth.passwordLabel`
- "Вход" → `t.buttons.login`
- "Невалиден имейл или парола" → `t.errors.invalidCredentials`
- "Твърде много опити..." → `t.errors.rateLimited`

**From Dashboard.tsx (Story 1.6):**
- "Табло" → `t.nav.dashboard`
- "Изход" → `t.nav.logout`

### Project Structure Notes

**Alignment with unified project structure:**
- i18n files go in `src/lib/i18n/` (new folder)
- Follows existing pattern of utilities in `src/lib/`
- Type definitions separate from implementation for clarity

**Detected variances:** None - this creates new structure per architecture.md

### Previous Story Intelligence (Story 1.6)

**Key Learnings:**
- Bulgarian text already hardcoded in Login.tsx and Dashboard.tsx
- Uses shadcn-ui components with Tailwind CSS
- React Context pattern established for auth state
- Path alias `@/` configured in vite.config.ts
- Test files go in `src/test/` folder

**Files to modify:**
- `src/pages/admin/Login.tsx` - replace hardcoded Bulgarian strings
- `src/pages/admin/Dashboard.tsx` - replace hardcoded Bulgarian strings

### Technical Stack [Source: architecture.md]

- React 18.3.1 with TypeScript
- Vite build system
- shadcn-ui components
- Tailwind CSS for styling
- Path aliases: `@/` points to `src/`

### Testing Approach

```typescript
// src/test/i18n.test.ts
import { describe, it, expect } from 'vitest';
import { translations, useTranslation } from '@/lib/i18n';

describe('Bulgarian Translation System', () => {
  it('should export all required navigation labels', () => {
    expect(translations.nav.dashboard).toBe('Табло');
    expect(translations.nav.news).toBe('Новини');
    expect(translations.nav.careers).toBe('Кариери');
    // ... etc
  });

  it('should export all required button labels', () => {
    expect(translations.buttons.create).toBe('Създай');
    expect(translations.buttons.save).toBe('Запази');
    // ... etc
  });

  it('should provide useTranslation hook that returns translations', () => {
    // Note: Hook testing requires renderHook from @testing-library/react-hooks
    const result = useTranslation();
    expect(result).toBe(translations);
  });
});
```

### Common Pitfalls to Avoid

1. **Don't use a complex i18n library (i18next, react-intl)** - Architecture specifies simple TypeScript object approach since only Bulgarian is needed
2. **Don't forget TypeScript types** - The main value is compile-time key validation
3. **Don't leave any hardcoded strings** - Run a grep for Bulgarian text after refactoring
4. **Don't nest too deeply** - Keep translation structure flat enough for easy access

### Verification Commands

```bash
cd frontend

# TypeScript compilation check
npm run build

# Run tests
npm run test

# Visual verification
npm run dev
# Navigate to /admin/login - all text should come from translations
# Navigate to /admin/dashboard - all text should come from translations
```

### References

- [Architecture: Localization](_bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns - Localization)
- [Architecture: Frontend Structure](_bmad-output/planning-artifacts/architecture.md#Monorepo Structure)
- [Epics: Story 2.1](_bmad-output/planning-artifacts/epics.md#Story 2.1)
- [Story 1.6: Frontend Authentication Integration](./1-6-frontend-authentication-integration.md)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 49 tests pass (14 new i18n tests + 35 existing tests)
- TypeScript build successful with no errors

### Completion Notes List

- **Task 1**: Created `src/lib/i18n/types.ts` with comprehensive TypeScript interface for Translations structure including nav, buttons, status, common, errors, success, contentTypes, and auth categories
- **Task 2**: Created `src/lib/i18n/bg.ts` with all Bulgarian translations implementing the Translations interface. Added additional error messages (emailRequired, passwordRequired, passwordMinLength) and auth fields (pageDescription, loggingIn) discovered during component refactoring
- **Task 3**: Created `src/lib/i18n/index.ts` exporting `translations`, `useTranslation()` hook, and `t` shorthand accessor with full TypeScript type safety
- **Task 4**: Refactored Login.tsx and Dashboard.tsx to use the translation system, replacing all hardcoded Bulgarian strings with translation references
- **Task 5**: Created comprehensive test suite with 14 tests covering all translation categories, hook functionality, and completeness validation

### File List

**Created:**
- frontend/src/lib/i18n/types.ts
- frontend/src/lib/i18n/bg.ts
- frontend/src/lib/i18n/index.ts
- frontend/src/test/i18n.test.ts
- frontend/src/test/Dashboard.test.tsx

**Modified:**
- frontend/src/pages/admin/Login.tsx
- frontend/src/pages/admin/Dashboard.tsx

## Change Log

- 2026-02-06: Story implementation complete - All 5 tasks completed, 49 tests pass (14 new + 35 existing)
- 2026-02-06: Code review fixes applied - Fixed hardcoded strings in Dashboard.tsx (H2), fixed English placeholder in Login.tsx (M1), added Dashboard integration tests (M2), added new translations (welcomeToAdminPanel, manageContent, temporaryPage, emailPlaceholder, passwordPlaceholder). All 56 tests pass (21 i18n + 7 Dashboard + 28 existing)

