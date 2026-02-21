/**
 * Type definitions for the Bulgarian translation system.
 * Provides TypeScript autocomplete and compile-time validation for translation keys.
 */

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
    welcomeToAdminPanel: string;
    manageContent: string;
    temporaryPage: string;
  };
  errors: {
    invalidCredentials: string;
    sessionExpired: string;
    rateLimited: string;
    required: string;
    invalidEmail: string;
    networkError: string;
    unauthorized: string;
    emailRequired: string;
    passwordRequired: string;
    passwordMinLength: string;
  };
  success: {
    saved: string;
    published: string;
    deleted: string;
    loggedIn: string;
    loggedOut: string;
  };
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
    pageDescription: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loggingIn: string;
  };
  dashboard: {
    drafts: string;      // Plural: "чернови"
    published: string;   // Plural: "публикувани"
  };
  help: {
    modalTitle: string;
    sections: {
      createContent: {
        title: string;
        content: string;
      };
      publishContent: {
        title: string;
        content: string;
      };
      editDelete: {
        title: string;
        content: string;
      };
      support: {
        title: string;
        content: string;
      };
    };
  };
}

/**
 * Type for accessing nested translation keys.
 * Enables type-safe key access patterns.
 */
export type TranslationKey = keyof Translations;
