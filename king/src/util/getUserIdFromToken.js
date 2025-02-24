import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode(accessToken);
    return decoded.userId; // ✅ 'userId' 필드 사용
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
};
