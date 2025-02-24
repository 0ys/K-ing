import { client } from './axios';

// 특정 큐레이션 상세 정보 가져오기 (GET 요청)
export const getCurationDetail = async (curationId) => {
  try {
    const { data } = await client.get(`/curation/${curationId}`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

//큐레이션 리스트 조회
export const getCurationList = async (query, cursor) => {
  try {
    const { data } = await client.get(
      `/curation-lists/search?query=${query || ''}&cursor=${cursor || ''}`,
    );
    // const { data } = await client.get(`/curation?size=10`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export const deleteCuration = async (curationId) => {
  try {
    const { data } = await client.delete(`/curation/${curationId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// 큐레이션 임시저장 조회
export const getCurationDraft = async () => {
  try {
    const { data } = await client.get(`/curation/draft`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

// 큐레이션 임시저장 삭제
export const deleteCurationDraft = async () => {
  try {
    const { data } = await client.delete(`/curation/draft`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 큐레이션 임시저장
export const postCurationDraft = async (draftInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(draftInfo);
  const draft = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('curation', draft);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.post(`/curation/draft`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 큐레이션 공유
export const createCuration = async (curationInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(curationInfo);
  const curation = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('curation', curation);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.post(`/curation`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 큐레이션 수정
export const updateCuration = async (curationId, curationInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(curationInfo);
  const curation = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('curation', curation);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.put(`/curation/${curationId}`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};
