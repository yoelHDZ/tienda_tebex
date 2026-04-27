import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../helpers/localManager';
import { getSettings } from '../utils/settings';
import { readLocaleMessages } from '../utils/messages-store';

export default getRequestConfig(async () => {
    const currentSettings = getSettings();
    const translationSettings = currentSettings?.translation_system || {};
    const locale = translationSettings.enabled ? await getUserLocale() : (translationSettings.default_language || 'en');
    const { locale: resolvedLocale, messages } = readLocaleMessages(locale);

    return {
        locale: resolvedLocale,
        messages
    };
});