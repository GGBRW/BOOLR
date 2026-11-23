export const locales = ['en', 'ar', 'arz'] as const;
export type Locale = (typeof locales)[number];
