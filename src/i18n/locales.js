export const LOCALES = {
    ENGLISH_US: "en-US",
    ENGLISH: "en-GB",
};

export const getLocale = (localeStr) => {
    return localeStr && Object.values(LOCALES).includes(localeStr) ? localeStr : LOCALES.ENGLISH;
};