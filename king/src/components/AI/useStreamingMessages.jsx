import { useCallback, useState } from 'react';

import { saveChatHistory } from '../../lib/chatbot';
import { splitIntoMessages } from '../../util/chatbot';

const useStreamingMessages = (selectedBot) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const updateMessages = useCallback(
    async (receivedText) => {
      if (receivedText === '[RESET]') {
        setMessages([]);
        setIsTyping(false);
        return;
      }

      setMessages((prevMessages) => {
        if (!receivedText.trim()) {
          console.log(prevMessages);

          return prevMessages;
        }

        let localMessages = [...prevMessages];
        const lastMessage = localMessages[localMessages.length - 1] || null;

        const accumulatedText =
          lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted
            ? lastMessage.text + receivedText
            : receivedText;

        if (receivedText === '[END]') {
          setIsTyping(false);

          const lastAssistantMessages = [];
          for (let i = localMessages.length - 1; i >= 0; i--) {
            if (localMessages[i].sender === 'assistant') {
              lastAssistantMessages.unshift(localMessages[i].text);
            } else {
              break;
            }
          }

          const lastAssistantMessage = lastAssistantMessages.join(' ').trim();
          if (!lastAssistantMessage || lastAssistantMessage.length === 0) {
            return localMessages;
          }

          if (lastAssistantMessage) {
            if (lastAssistantMessage.includes('[추천]')) {
              const recommendNameMatch = lastAssistantMessage.match(/\[추천\]\s+\[(.+?)\]/);
              const recommendName = recommendNameMatch ? recommendNameMatch[1] : null;

              if (recommendName) {
                const recommendMessage = {
                  sender: 'recommend',
                  text: recommendName,
                  type: 'recommend',
                  isCompleted: true,
                };

                localMessages.push(recommendMessage);
                saveRecommendationMessage(recommendName);
              }
            }

            // 중국어 [推荐] 태그 감지
            else if (lastAssistantMessage.includes('[推荐]')) {
              const recommendNameMatch = lastAssistantMessage.match(/\[推荐\]\s+\[(.+?)\]/);
              const recommendName = recommendNameMatch ? recommendNameMatch[1] : null;

              if (recommendName) {
                const recommendMessage = {
                  sender: 'recommend',
                  text: recommendName,
                  type: 'recommend',
                  isCompleted: true,
                };

                localMessages.push(recommendMessage);
                saveRecommendationMessage(recommendName);
              }
            }

            // 일본어 [推荐] 태그 감지
            else if (lastAssistantMessage.includes('[推薦]')) {
              const recommendNameMatch = lastAssistantMessage.match(/\[推薦\]\s+\[(.+?)\]/);
              const recommendName = recommendNameMatch ? recommendNameMatch[1] : null;

              if (recommendName) {
                const recommendMessage = {
                  sender: 'recommend',
                  text: recommendName,
                  type: 'recommend',
                  isCompleted: true,
                };

                localMessages.push(recommendMessage);
                saveRecommendationMessage(recommendName);
              }
            }
          }

          return localMessages.map((msg, index) =>
            index === localMessages.length - 1 ? { ...msg, isCompleted: true } : msg,
          );
        }

        const newMessages = splitIntoMessages(accumulatedText, 'assistant', selectedBot).filter(
          (msg) => msg.text.trim() !== '',
        );

        if (lastMessage && lastMessage.sender === 'assistant' && !lastMessage.isCompleted) {
          localMessages = [...localMessages.slice(0, -1), ...newMessages];
        } else {
          localMessages = [...localMessages, ...newMessages];
        }

        return localMessages;
      });
    },
    [selectedBot],
  );

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
  } catch (error) {
    console.error('❌ 추천 메시지 저장 실패:', error);
  }
};

export default useStreamingMessages;
