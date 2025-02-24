import { client } from './axios';

export const postFcmToken = async (token) => {
  try {
    const res = await client.post('/fcm', { token });
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const deleteFcmToken = async (token) => {
  try {
    const res = await client.delete('/fcm', { token });
    return res;
  } catch (err) {
    console.error(err);
  }
};
