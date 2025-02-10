import { useCallback, useRef, useState } from 'react';

import { saveChatHistory } from '../../lib/chatbot';
import { splitIntoSentences } from '../../util/chatbot';

const useStreamingMessages = () => {
  const [messages, setMessages] = useState([]); // 메시지 상태
  const [isTyping, setIsTyping] = useState(false); // 타이핑 상태

  /**
   * 📩 서버로부터 받은 메시지를 업데이트하는 함수
   * @param {string} receivedText - 서버에서 받은 텍스트 (한 글자씩 또는 문장 단위)
   */
  const updateMessages = useCallback(async (receivedText) => {
    if (receivedText === '[RESET]') {
      setMessages([]);
      setIsTyping(false);
      return;
    }

    setMessages((prevMessages) => {
      // ✅ 로컬 메시지 리스트로 관리
      let localMessages = [...prevMessages];

      const lastMessage = localMessages.length > 0 ? localMessages[localMessages.length - 1] : null;

      const accumulatedText =
        lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted
          ? lastMessage.text + receivedText
          : receivedText;

      if (receivedText === '[END]') {
        setIsTyping(false); // ✅ 서버 응답 완료 시 타이핑 중지

        // ✅ 마지막 Assistant 메시지 그룹 가져오기
        let lastAssistantMessages = [];
        for (let i = localMessages.length - 1; i >= 0; i--) {
          if (localMessages[i].sender === 'assistant') {
            lastAssistantMessages.unshift(localMessages[i].text);
          } else {
            break; // 유저 메시지가 나오면 멈춤
          }
        }

        // ✅ 문자열로 변환하여 처리
        const lastAssistantMessage = lastAssistantMessages.join(' '); // 여러 메시지를 하나로 변환
        //console.log('🔍 마지막 Assistant 메시지:', lastAssistantMessage);

        // ✅ [추천] 키워드가 있는지 검사
        if (lastAssistantMessage.includes('[추천]')) {
          //console.log('✅ [추천] 키워드 감지됨!');

          // ✅ 추천된 장소 이름 추출
          const recommendNameMatch = lastAssistantMessage.match(/\[추천\]\s+\[(.+?)\]/);
          const recommendName = recommendNameMatch ? recommendNameMatch[1] : null;

          if (recommendName) {
            //console.log('✅ 감지된 추천 장소:', recommendName);

            // ✅ 추천 메시지 추가
            const recommendMessage = {
              sender: 'recommend',
              text: recommendName,
              isCompleted: true,
            };
            localMessages.push(recommendMessage);

            // ✅ 데이터베이스에 저장
            saveRecommendationMessage(recommendName);
          }
        }

        // ✅ 마지막 메시지를 완료 상태로 업데이트
        localMessages = localMessages.map((msg, index) =>
          index === localMessages.length - 1 ? { ...msg, isCompleted: true } : msg,
        );

        return localMessages;
      }

      // ✅ 새로운 문장을 문장 단위로 나누기
      const newMessages = splitIntoSentences(accumulatedText, 'assistant');

      if (lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted) {
        // ✅ 기존 메시지 업데이트
        localMessages = [...localMessages.slice(0, -1), ...newMessages];
      } else {
        // ✅ 새로운 메시지 추가
        localMessages = [...localMessages, ...newMessages];
      }

      return localMessages;
    });
  }, []);

  return { messages, isTyping, updateMessages, setMessages, setIsTyping };
};

const saveRecommendationMessage = async (recommendName) => {
  if (!recommendName) {
    return;
  }

  const recommendMessage = {
    sender: 'recommend',
    text: recommendName,
    type: 'recommend',
  };

  try {
    await saveChatHistory(recommendMessage.sender, recommendMessage.text, recommendMessage.type);
    //console.log('✅ 추천 메시지 저장 완료:', recommendMessage);
  } catch (error) {
    console.error('❌ 추천 메시지 저장 실패:', error);
  }
};

export default useStreamingMessages;
