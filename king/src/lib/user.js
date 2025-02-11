import { client } from './axios';

// 사용자 프로필 정보 가져오기
export const getUserProfile = async (userId) => {
  try {
    const response = await client.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('프로필 데이터를 불러오는 중 오류 발생:', error);
    throw error;
  }
};

// 프로필 수정 API (multipart/form-data 적용)
export const updateUserProfile = async (profileData, imageFile) => {
  try {
    const formData = new FormData();

    // 서버가 요구하는 "user" 키 추가
    const userObject = JSON.stringify(profileData);
    formData.append('user', new Blob([userObject], { type: 'application/json' }));

    // 프로필 이미지 추가 (파일이 존재하는 경우에만)
    if (imageFile instanceof File) {
      formData.append('imageFile', imageFile);
    }

    const response = await client.patch('/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const accessToken = response.headers.authorization?.split(' ')[1];
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }

    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 중 오류 발생:', error.response?.data || error.message);
    throw error;
  }
};

// 알람 설정 업데이트 API (multipart/form-data 적용)
export const updateNotificationSetting = async (isOn) => {
  try {
    const formData = new FormData();

    // 서버가 요구하는 "user" 키 추가
    const userObject = JSON.stringify({ contentAlarmOn: isOn });
    formData.append('user', new Blob([userObject], { type: 'application/json' }));

    const response = await client.patch('/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    alert('알람 설정 변경 중 오류가 발생했습니다.');
    // console.error('알람 설정 업데이트 중 오류 발생:', error.response?.data || error.message);
    throw error;
  }
};
