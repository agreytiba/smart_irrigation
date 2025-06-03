import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import sw from '../locales/sw.json';

const i18n = new I18n({ en, sw });

i18n.locale = Localization.locale?.startsWith('sw') ? 'sw' : 'en';
i18n.enableFallback = true;

export const setI18nConfig = (locale: string) => {
  i18n.locale = locale;
};

export const getI18nLocale = () => i18n.locale;

export default i18n;
