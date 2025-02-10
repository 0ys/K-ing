import { client } from './axios';

// 게시글 임시저장 조회
export const getPostDraft = async () => {
  try {
    const { data } = await client.get(`/post/draft`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 임시저장 삭제
export const deletePostDraft = async () => {
  try {
    const { data } = await client.delete(`/post/draft`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 임시저장
export const postDraft = async (draftInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(draftInfo);
  const draft = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('draft', draft);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.post(`/post/draft`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 공유
export const createPost = async (postInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(postInfo);
  const post = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('post', post);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.post(`/post`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 조회
export const getPostDetail = async (postId) => {
  try {
    const { data } = await client.get(`/post/${postId}`);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 삭제
export const deletePost = async (postId) => {
  try {
    const { data } = await client.delete(`/post/${postId}`);
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 게시글 수정
export const updatePost = async (postId, postInfo, image) => {
  const requestBody = new FormData();
  const jsonDraftData = JSON.stringify(postInfo);
  const post = new Blob([jsonDraftData], { type: 'application/json' });
  requestBody.append('post', post);

  if (image) {
    requestBody.append('imageFile', image);
  }

  try {
    const { data } = await client.post(`/post/${postId}`, requestBody, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 댓글 생성
export const createComment = async (postId, content) => {
  try {
    const { data } = await client.post(`/post/${postId}/comment`, content);
    return data;
  } catch (err) {
    console.error(err);
  }
};

//댓글 삭제
export const deleteComment = async (postId, commentId) => {
  try {
    const { data } = await client.delete(`/post/${postId}/comment/${commentId}`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 좋아요
export const likePost = async (postId) => {
  try {
    const { data } = await client.post(`/post/${postId}/like`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

// 좋아요 해제
export const unLikePost = async (postId) => {
  try {
    const { data } = await client.delete(`/post/${postId}/like`);
    return data;
  } catch (err) {
    console.error(err);
  }
};
