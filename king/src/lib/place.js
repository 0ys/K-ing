import { client } from './axios';

// 특정 장소 정보 가져오기 (GET 요청)
export const getPlaceDetail = async (placeId) => {
  try {
    const { data } = await client.get(`/place/${placeId}`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
