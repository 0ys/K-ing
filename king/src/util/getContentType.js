import { getLanguage, getTranslations } from './languageUtils';

const CONTENT_TYPE = ['drama', 'movie', 'show', 'cast', 'place'];

export const getContentTypeLocalized = (type) => {
  const language = getLanguage();
  const { content: translations } = getTranslations(language);

  return CONTENT_TYPE.includes(type) ? translations[type] : '';
};
