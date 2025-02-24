import { client } from './axios';

// 검색어 및 지역 정보로 장소 검색 (GET 요청)
export const searchMapView = async (query, region, relatedType, boundingBox) => {
  try {
    const params = new URLSearchParams({
      query: query || '',
      relatedType: relatedType || '',
    });

    if (region) {
      params.append('region', region);
    }

    if (boundingBox && boundingBox.swLat !== 0) {
      params.append('boundingBox.swLat', boundingBox.swLat.toString());
      params.append('boundingBox.swLng', boundingBox.swLng.toString());
      params.append('boundingBox.neLat', boundingBox.neLat.toString());
      params.append('boundingBox.neLng', boundingBox.neLng.toString());
    }

    const { data } = await client.get('/search/map-view', { params });

    if (!data || !data.data || !data.data.places) {
      console.warn('Warning: No places data found');
      return [];
    }
    return data.data.places;
  } catch (err) {
    console.error('Error during fetching places:', err);
    throw err; // 필요하다면 에러를 다시 throw
  }
};
