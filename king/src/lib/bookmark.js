import { client } from './axios';

// 북마크한 큐레이션 가져오기
export const getCurations = async () => {
  try {
    const response = await client.get('/curation?bookmarked=true');
    if (response.data.success) {
      return response.data.data.curations;
    }
    return [];
  } catch (error) {
    console.error('큐레이션 데이터를 불러오는 중 오류 발생:', error);
    return [];
  }
};

// 북마크 추가
export const addBookmark = async (curationId) => {
  try {
    const response = await client.post('/bookmark', { curationId });

    if (response.status === 201 && response.data.success) {
      return true; // 성공
    }
    return false;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 409) {
        console.warn(`⚠️ 이미 북마크된 큐레이션입니다: ${curationId}`);
      } else if (status === 404) {
        console.error(`큐레이션을 찾을 수 없음: ${curationId} - ${data.message}`);
      }
    } else {
      console.error(`북마크 추가 실패: ${curationId}`, error);
    }
    return false;
  }
};

// 북마크 해제
export const removeBookmark = async (curationId) => {
  try {
    await client.delete('/bookmark', {
      data: { curationId },
    });
    return true; // 성공하면 true 반환
  } catch (error) {
    console.error(`❌ 북마크 해제 실패: ${curationId}`, error);
    return false;
  }
};
