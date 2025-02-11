import accountLocales from '../locales/account.json';
import commonLocales from '../locales/common.json';
import deleteAccountLocales from '../locales/deleteAccount.json';
import notificationLocales from '../locales/notification.json';
import profileLocales from '../locales/profile.json';
import settingLocales from '../locales/setting.json';
import signupLocales from '../locales/signup.json';

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
});
