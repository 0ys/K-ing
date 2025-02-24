import { getUserProfile } from '../lib/user';

export const getUserInfoById = async (userId) => {
  const { data } = await getUserProfile(userId);
  return { nickname: data.nickname, imageUrl: data.imageUrl };
};
