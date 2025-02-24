import { client } from './axios';

export const getChatHistory = async () => {
  try {
    const response = await client.get('/chatbot/');
    return response.data;
  } catch (err) {
    console.error('대화 기록을 불러오지 못했습니다:', err);
    return [];
  }
};

export const saveChatHistory = async (role, content, type) => {
  try {
    await client.post('/chatbot/save', {
      role,
      content,
      type,
    });
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const deleteChatHistory = async () => {
  try {
    await client.delete('/chatbot/');
  } catch (error) {
    console.error('Error deleting chat history:', error);
  }
};

export const getResponse = async (currentApi, userMessage) => {
  try {
    const response = await client.post(currentApi, { userMessage });
    return response.data.message;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'AI 응답을 불러오지 못했습니다.';
  }
};
