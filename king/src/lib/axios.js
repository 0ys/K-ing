import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { tokenRefresh } from './auth';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL,
  headers: {
    'Content-type': 'application/json',
  },
  withCredentials: true, // 쿠키를 포함하여 요청 (refreshToken 자동 전송)
});

// ✅ 요청 인터셉터: 모든 요청에 `accessToken` 자동 추가
client.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem('accessToken');
    // let accessToken = import.meta.env.VITE_MASTER_ACCESS_TOKEN;

    const isNicknameCheckRequest = config.url.includes('/user/nickname');
    const isTokenRefresh = config.url.includes('/user/token-refresh');
    const isSignupRequest = config.url.includes('/user/signup');
    // console.log('isNicknameCheckRequest : ' + isNicknameCheckRequest);
    // console.log('isTokenRefresh : ' + isTokenRefresh);

    if (!isTokenRefresh && accessToken) {
      // console.log('if 문에 들어 왔어용');
      // 🔥 accessToken에서 role 가져오기
      try {
        const decoded = jwtDecode(accessToken);
        const userRole = decoded.role; // ✅ 토큰에서 role 추출
        // console.log('🔍 현재 유저 역할:', userRole);

        // 🔥 ROLE_REGISTERED가 아닌 경우 강제 이동
        // 🔥 ROLE_PENDING 사용자는 닉네임 중복 검사 API 요청만 가능하도록 예외 처리
        if (userRole === 'ROLE_PENDING' && (isNicknameCheckRequest || isSignupRequest)) {
          console.log('✅ ROLE_PENDING 사용자, 닉네임 중복 검사 & 회원가입 요청 허용');
        } else if (userRole !== 'ROLE_REGISTERED') {
          console.warn('❌ 접근 불가: 해당 페이지는 ROLE_REGISTERED만 가능합니다.');
          window.location.replace('/');
          return Promise.reject('접근 권한 없음'); // 요청 중단
        }
      } catch (error) {
        console.error('❌ 토큰 디코딩 실패:', error);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 토큰 재발급 요청 횟수 관리 변수
let isRefreshing = false;

// ✅ 응답 인터셉터: accessToken이 만료되면 자동 재발급
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔹 닉네임 중복 검사 요청은 401이어도 예외 처리 (차단하지 않음)
    if (originalRequest.url.includes('/user/nickname')) {
      console.warn('⚠️ 닉네임 중복 검사 요청에서 401 발생 → 응답 유지');
      return Promise.reject(error); // 요청을 중단하지 않고 그대로 진행
    }

    // 🔹 401 에러 발생 시 (로그인한 사용자가 아닌 경우)
    if (error.response?.status === 401) {
      // 🔹 `/user/token-refresh` 요청에서 401이 발생한 경우 → 즉시 `/`로 이동
      if (originalRequest.url.includes('/user/token-refresh')) {
        console.log('❌ Refresh token 만료됨 → 로그인 페이지로 이동');
        localStorage.removeItem('accessToken'); // 토큰 삭제
        window.location.replace('/');
        return Promise.reject(error);
      }

      // 🔹 이미 토큰 갱신 중이면 기다리도록 설정 (무한 요청 방지)
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        console.log('🔄 AccessToken 만료: 재발급 시도');
        const newAccessToken = await tokenRefresh();

        if (newAccessToken) {
          const decoded = jwtDecode(newAccessToken);
          const userRole = decoded.role;

          if (userRole !== 'ROLE_REGISTERED') {
            console.warn('❌ 접근 불가: ROLE_REGISTERED만 가능');
            window.location.replace('/');
            return Promise.reject('접근 권한 없음');
          }
          // ✅ 새로운 accessToken으로 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ 토큰 재발급 실패 → 로그인 페이지로 이동');
        localStorage.removeItem('accessToken'); // 토큰 삭제
        navigate('/'); // 🔹 로그인 페이지로 이동
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const mainGetFetcher = (url) => client.get(url).then((res) => res.data);

export { client, mainGetFetcher };
