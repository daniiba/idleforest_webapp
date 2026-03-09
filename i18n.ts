import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'es', 'de', 'pt', 'fr'];

export default getRequestConfig(async ({ requestLocale }) => {
    // Get the locale from the request, default to 'en' for non-locale routes
    let locale = await requestLocale;

    if (!locale || !locales.includes(locale)) {
        locale = 'en';
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
