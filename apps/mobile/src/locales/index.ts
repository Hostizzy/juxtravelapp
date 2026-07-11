import i18n from './i18n';

export function useI18n() {
  return {
    t: (key: string, options?: any) => i18n.t(key, options),
    locale: i18n.locale,
    changeLocale: (locale: string) => {
      i18n.locale = locale;
    },
  };
}

export { default as i18n } from './i18n';
