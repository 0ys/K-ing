import { client } from './axios';

// ✅ 즐겨찾기 목록 조회 (GET)
export const getFavorites = async (type) => {
  try {
    const response = await client.get(`/favorite?type=${type}`);
    return response.data.data.favorites || [];
  } catch (error) {
    console.error('❌ 즐겨찾기 목록 조회 실패:', error);
    return [];
  }
};

// ✅ 즐겨찾기 제거 (DELETE)
export const removeFavorite = async (favoriteId) => {
  try {
    await client.delete(`/favorite/${favoriteId}`);
    return true; // 성공 시 true 반환
  } catch (error) {
    console.error(`❌ 즐겨찾기 삭제 실패: ${favoriteId}`, error);
    return false;
  }
};
