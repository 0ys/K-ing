import { jwtDecode } from 'jwt-decode';

import accountLocales from '../locales/account.json';
import signupLocales from '../locales/signup.json';
import { getLanguage, setLanguage } from '../util/languageUtils';
import { client } from './axios';
import { deleteFcmToken } from './fcm';

// 닉네임 중복 검사 API
export const checkNickname = async (nickname, language = 'ko') => {
  try {
    const res = await client.get(`/user/nickname?nickname=${nickname}`);
    return { success: res.data.success, message: '' }; // 닉네임 사용 가능
  } catch (err) {
    // console.error('닉네임 중복 검사 실패:', err);

    // 닉네임이 중복된 경우 (409 상태 코드)
    if (err.response?.status === 409) {
      return {
        success: false,
        message: signupLocales[language].nicknameErrorDuplicate,
      };
    }

    // 서버 오류 또는 다른 예외 처리
    return {
      success: false,
      message: signupLocales[language]?.serverError,
    };
  }
};

// 회원가입 API (AccessToken 저장 및 에러 처리 포함)
export const postSignup = async (nickname, language) => {
  try {
    const res = await client.post('/user/signup', { nickname, language });

    // 서버가 응답 헤더에 AccessToken을 포함하면 저장
    const accessToken = res.headers.authorization?.split(' ')[1];
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);

      // 새로운 `language` 값으로 localStorage에 저장
      const decoded = jwtDecode(accessToken);
      if (decoded.language) {
        setLanguage(decoded.language);
      }
    }

    return { success: true, message: '' };
  } catch (err) {
    console.error('회원가입 요청 실패:', err);
    console.error('회원가입 요청 실패:', err.response ? err.response.data : err);

    if (err.response) {
      const { code } = err.response.data;
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';

      if (code === 'INVALID_NICKNAME') {
        errorMessage = '유효하지 않은 닉네임입니다.';
      } else if (code === 'INVALID_LANGUAGE') {
        errorMessage = '유효하지 않은 언어코드입니다.';
      } else if (code === 'DUPLICATED_NICKNAME') {
        errorMessage = '중복된 닉네임입니다.';
      }

      return { success: false, message: errorMessage };
    }

    return { success: false, message: '서버 오류가 발생했습니다. 다시 시도해주세요.' };
  }
};

// 토큰 재발급 API
export const tokenRefresh = async () => {
  try {
    const res = await client.post(
      '/user/token-refresh',
      {},
      {
        withCredentials: true, // 쿠키를 포함하여 요청 (refreshToken 자동 포함)
      },
    );

    // 새 accessToken을 로컬 스토리지에 저장
    const newAccessToken = res.headers.authorization?.split(' ')[1];
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);

      // 새로운 `language` 값으로 업데이트
      const decoded = jwtDecode(newAccessToken);
      if (decoded.language) {
        setLanguage(decoded.language);
      }
    }

    return newAccessToken;
  } catch (err) {
    console.error('토큰 재발급 실패:', err);

    // ❌ 토큰이 유효하지 않거나 만료되었을 경우 -> 로그인 페이지로 이동
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken'); // 기존 accessToken 삭제
      window.location.href = '/'; // 로그인 페이지로 리디렉트
    }

    return null;
  }
};

// 로그아웃 API 요청
export const logout = async () => {
  try {
    const res = await client.post('/user/logout', {});
    console.log('✅ 로그아웃 성공:', res.status);
    return true;
  } catch (err) {
    console.error('❌ 로그아웃 실패:', err.response ? err.response.status : err);
  }
  return false;
};

// 회원 탈퇴 API 요청
export const deleteAccount = async () => {
  const language = getLanguage();
  try {
    const res = await client.delete('/user', {});

    localStorage.removeItem('accessToken');
    if (localStorage.getItem('fcmToken')) {
      await deleteFcmToken(localStorage.getItem('fcmToken'));
      localStorage.removeItem('fcmToken');
    }

    return {
      success: true,
      message: accountLocales[language]?.accountDeleted,
    };
  } catch (err) {
    console.error('❌ 계정 삭제 실패:', err.response ? err.response.data : err);

    if (err.response) {
      const { status } = err.response;
      if (status === 401) {
        return { success: false, message: accountLocales[language]?.unauthorized };
      } else if (status === 403) {
        return { success: false, message: accountLocales[language]?.forbidden };
      } else if (status === 404) {
        return {
          success: false,
          message: accountLocales[language]?.userNotFound,
        };
      }

      return { success: false, message: accountLocales[language]?.deleteFailed };
    }
  }
};
