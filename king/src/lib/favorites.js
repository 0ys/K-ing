import { convertType } from '../util/convertType';
import { client } from './axios';

// 즐겨찾기 목록 조회
export const getFavorites = async (type) => {
  try {
    const response = await client.get(`/favorite?type=${type}`);
    return response.data.data.favorites || [];
  } catch (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    return [];
  }
};

// 즐겨찾기 해제
export const removeFavorite = async (frontendType, targetId) => {
  const type = convertType(frontendType);
  try {
    const response = await client.delete(`/favorite`, {
      params: { type, targetId },
    });

    return response.data.success;
  } catch (error) {
    console.error('즐겨찾기 해제 실패:', error.response?.data || error.message);
    return false;
  }
};

// 즐겨찾기 등록
export const addFavorite = async (frontendType, targetId) => {
  const type = convertType(frontendType);
  try {
    const response = await client.post(`/favorite`, null, {
      params: { type, targetId },
    });

    return response.data.success;
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error.response?.data || error.message);
    return false;
  }
};
