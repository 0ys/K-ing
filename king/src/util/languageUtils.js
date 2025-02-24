import accountLocales from '../locales/account.json';
import archivelLocales from '../locales/archive.json';
import chatbotLocales from '../locales/chatbot.json';
import commonLocales from '../locales/common.json';
import contentLocales from '../locales/content.json';
import curationLocales from '../locales/curation.json';
import deleteAccountLocales from '../locales/deleteAccount.json';
import feedLocales from '../locales/feed.json';
import homeLocales from '../locales/home.json';
import mapLocales from '../locales/map.json';
import notificationLocales from '../locales/notification.json';
import placeLocales from '../locales/place.json';
import postLocales from '../locales/post.json';
import profileLocales from '../locales/profile.json';
import reviewLocales from '../locales/review.json';
import searchLocales from '../locales/search.json';
import settingLocales from '../locales/setting.json';
import signupLocales from '../locales/signup.json';
import uploadModalLocales from '../locales/uploadmodal.json';
import userLocales from '../locales/user.json';

const LANGUAGE_KEY = 'language';

// 현재 언어 가져오기 (localStorage에서 불러오거나 기본값 사용)
export const getLanguage = () => {
  return localStorage.getItem(LANGUAGE_KEY) || 'ko';
};

// 언어 변경 (localStorage & Recoil 상태에 저장)
export const setLanguage = (lang) => {
  localStorage.setItem(LANGUAGE_KEY, lang);
  window.dispatchEvent(new Event('languageChange'));
};

// 언어에 맞는 번역 데이터 가져오기
export const getTranslations = (lang = getLanguage()) => ({
  common: commonLocales[lang] || commonLocales['ko'],
  profile: profileLocales[lang] || profileLocales['ko'],
  signup: signupLocales[lang] || signupLocales['ko'],
  notification: notificationLocales[lang] || notificationLocales['ko'],
  setting: settingLocales[lang] || settingLocales['ko'],
  account: accountLocales[lang] || accountLocales['ko'],
  deleteAccount: deleteAccountLocales[lang] || deleteAccountLocales['ko'],
  archive: archivelLocales[lang] || archivelLocales['ko'],
  home: homeLocales[lang] || homeLocales['ko'],
  user: userLocales[lang] || userLocales['ko'],
  content: contentLocales[lang] || contentLocales['ko'],
  search: searchLocales[lang] || searchLocales['ko'],
  post: postLocales[lang] || postLocales['ko'],
  uploadModal: uploadModalLocales[lang] || uploadModalLocales['ko'],
  map: mapLocales[lang] || mapLocales['ko'],
  place: placeLocales[lang] || placeLocales['ko'],
  review: reviewLocales[lang] || reviewLocales['ko'],
  curation: curationLocales[lang] || curationLocales['ko'],
  feed: feedLocales[lang] || feedLocales['ko'],
  chatbot: chatbotLocales[lang] || chatbotLocales['ko'],
});
