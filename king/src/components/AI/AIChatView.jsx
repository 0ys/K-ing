import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import SendIcon from '../../assets/icons/chat-send.png';
import KingIcon from '../../assets/icons/king_character.png';
import { deleteChatHistory, getChatHistory, saveChatHistory } from '../../lib/chatbot';
import {
  closeWebSocket,
  connectWebSocket,
  isWebSocketConnected,
  sendMessageViaWebSocket,
} from '../../lib/websocket';
import { splitIntoMessages } from '../../util/chatbot';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import { getUserInfoById } from '../../util/getUserInfoById';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import CurationRecommendButton from './CurationRecommendButton';
import PlaceRecommendButton from './PlaceRecommendButton';
import TypingIndicator from './TypingIndicator';
import useStreamingMessages from './useStreamingMessages';

const AIChatView = () => {
  const userId = getUserIdFromToken();

  const [newMessage, setNewMessage] = useState('');
  const [selectedBot, setSelectedBot] = useState('');
  const { messages, isTyping, updateMessages, setMessages, setIsTyping } =
    useStreamingMessages(selectedBot);
  const [currentApi, setCurrentApi] = useState('');
  const [isBotSelected, setIsBotSelected] = useState(false);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);

  const [isComposing, setIsComposing] = useState(false); //맥북 한글입력 중복 방지,,
  const messagesEndRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [userInfo, setUserInfo] = useState('');

  const [language, setLanguage] = useState(getLanguage());
  const { chatbot: chatbotTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    const getUserInfo = async () => {
      const userInfo = await getUserInfoById(userId);
      setUserInfo(userInfo.nickname);
    };

    getUserInfo();
  }, [userId]);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

  const chatT = chatbotTranslations.chatT;
  const chatF = chatbotTranslations.chatF;

  const saveInitialMessage = async () => {
    const initialMessage = {
      text: chatbotTranslations.initialMessage,
      sender: 'assistant',
      type: 'message',
    };
    setMessages([initialMessage]);
    await saveChatHistory('assistant', initialMessage.text, 'message');
  };

  const handleRefresh = async () => {
    await deleteChatHistory();

    updateMessages('[RESET]');
    setNewMessage('');
    setCurrentApi('');
    setIsBotSelected(false);
    setSelectedBot('');

    await saveInitialMessage();
  };

  // ✅ WebSocket 연결
  useEffect(() => {
    if (!isBotSelected || !currentApi) return;

    console.log('🔹 WebSocket 연결 시도:', currentApi);
    connectWebSocket(currentApi, updateMessages);

    return () => {
      closeWebSocket(); // ✅ 컴포넌트 언마운트 시 WebSocket 닫기
    };
  }, [isBotSelected, currentApi, updateMessages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      console.error('⚠️ 메시지가 비어 있음.');
      return;
    }

    if (!isWebSocketConnected()) {
      console.error('⚠️ WebSocket이 닫혀 있음.');
      return;
    }

    const userMessage = { text: newMessage, sender: 'user', type: 'message' };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    sendMessageViaWebSocket(newMessage);
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      const data = await getChatHistory();

      if (data.length > 0) {
        let newMessages = [];
        let detectedBotType = '';

        data.forEach((msg) => {
          if (msg.type === 'option') {
            detectedBotType = msg.content;
            setSelectedBot(detectedBotType);
          }

          if (msg.role === 'assistant') {
            newMessages = [
              ...newMessages,
              ...splitIntoMessages(msg.content, 'assistant', selectedBot).filter(
                (msg) => msg.text.trim() !== '',
              ),
            ];
          } else {
            newMessages.push({ text: msg.content, sender: msg.role });
          }
        });

        if (detectedBotType) {
          setCurrentApi(
            detectedBotType === chatT ? `${WS_BASE_URL}/ws/chatT` : `${WS_BASE_URL}/ws/chatF`,
          );
          setSelectedBot(detectedBotType);
          setIsBotSelected(true);
          setHasSentInitialMessage(true);
        }

        setMessages(newMessages);
      } else {
        saveInitialMessage();
        setIsBotSelected(false);
        setHasSentInitialMessage(false);
      }
    };

    fetchChatHistory();
  }, []);

  // ✅ messages가 변경될 때 마지막 메시지로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 챗봇 선택
  const handleOptionClick = async (option) => {
    setSelectedBot(option);
    setIsBotSelected(true);
    setHasSentInitialMessage(false);

    const optionMessage = { text: option, sender: 'option', type: 'option' };
    setMessages((prev) => [...prev, optionMessage]);
    await saveChatHistory('option', option, 'option');
  };

  useEffect(() => {
    if (!selectedBot || hasSentInitialMessage) return;
    //console.log('💡 selectedBot 변경 감지:', selectedBot);

    let aiMessage;
    if (selectedBot === chatT) {
      setCurrentApi(`${WS_BASE_URL}/ws/chatT`);
      aiMessage = chatbotTranslations.chatTDesc;
    } else if (selectedBot === chatF) {
      setCurrentApi(`${WS_BASE_URL}/ws/chatF`);
      aiMessage = chatbotTranslations.chatFDesc;
    }

    updateMessages(aiMessage);
    updateMessages('[END]');
    saveChatHistory('assistant', aiMessage, 'message');

    setHasSentInitialMessage(true);
  }, [selectedBot]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isBotSelected) {
      if (isComposing) {
        return; // ✅ IME 입력 중에는 Enter 키 무시
      }

      e.preventDefault();
      sendMessage(); // ✅ IME 입력이 완료된 후 정상적으로 실행
    }
  };

  const getRemInPixels = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  };

  const remValue = getRemInPixels(5);

  return (
    <ChatContainer>
      <Header>
        <BackButton />
        <p>K-ing {chatbotTranslations.title}</p>
        <RefreshButton onClick={handleRefresh}>
          <p>{chatbotTranslations.newTalk}</p>
          {/* <img src={RefreshIcon} alt="Refresh" /> */}
        </RefreshButton>
      </Header>

      <MessagesContainer style={{ height: `${windowHeight - remValue}px` }}>
        <IntroMessageContainer>
          <img src={KingIcon} />
          {chatbotTranslations.greeting},'
          {userInfo.length > 10 ? ` ${userInfo.slice(0, 10)}... ` : userInfo}'
          {chatbotTranslations.honorific}
          <br />
          {chatbotTranslations.ask}
        </IntroMessageContainer>

        {messages.map((message, index) => (
          <Message key={index} $sender={message.sender}>
            {message.sender === 'option' ? (
              <OptionMessageBubble ref={index === messages.length - 1 ? messagesEndRef : null}>
                {message.text}
              </OptionMessageBubble>
            ) : message.sender === 'assistant' ? (
              <ChatBotContainer>
                <MessageBubble
                  $sender={message.sender}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                >
                  {message.text}
                </MessageBubble>
                {index === 0 && (
                  <ButtonContainer>
                    <OptionButton onClick={() => handleOptionClick(chatT)} disabled={isBotSelected}>
                      {chatT}
                    </OptionButton>
                    <OptionButton onClick={() => handleOptionClick(chatF)} disabled={isBotSelected}>
                      {chatF}
                    </OptionButton>
                  </ButtonContainer>
                )}
              </ChatBotContainer>
            ) : message.sender === 'recommend' ? (
              selectedBot === chatT ? (
                <PlaceRecommendButton message={message} />
              ) : (
                <CurationRecommendButton message={message} />
              )
            ) : (
              <MessageBubble
                $sender={message.sender}
                ref={index === messages.length - 1 ? messagesEndRef : null}
              >
                {message.text}
              </MessageBubble>
            )}
          </Message>
        ))}
        {isTyping && <TypingIndicator />}
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          placeholder={
            isBotSelected ? chatbotTranslations.msgPlaceholder : chatbotTranslations.botPlaceholder
          }
          disabled={!isBotSelected}
        />
        <SendButton onClick={isBotSelected ? sendMessage : null} disabled={!isBotSelected}>
          <img src={SendIcon} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  position: sticky;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem 2rem;
  width: 100%;
  box-sizing: border-box;

  p {
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.MainBlue};
  padding: 0.2rem 0.7rem;

  p {
    ${({ theme }) => theme.fonts.Body4};
    color: white;
  }

  img {
    width: 1rem;
    height: 1rem;
  }
`;

const IntroMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 0 1.2rem 0;
  width: 100%;
  ${({ theme }) => theme.fonts.Body2};

  img {
    width: 3.6rem;
    height: 3.6rem;
  }
`;

const MessagesContainer = styled.div`
  width: 100%;
  //height: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $sender }) =>
    $sender === 'user' || $sender === 'option' ? 'flex-end' : 'flex-start'};
  margin-bottom: 1rem;
`;

const MessageBubble = styled.div`
  display: inline-block;
  max-width: 90%;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  background-color: ${({ $sender }) => ($sender === 'user' ? '#D9EAFF' : '#DFD9FF')};
  color: ${({ theme }) => theme.fonts.Body4};
  ${({ theme }) => theme.fonts.Body4};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.07);
  word-wrap: break-word; // 단어가 길 경우 줄 바꿈
  white-space: pre-wrap; // 줄 바꿈 및 공백 유지
  width: fit-content; // 내용 길이에 따라 너비 조절
`;

const OptionMessageBubble = styled.div`
  padding: 0.2rem 0.5rem;
  background-color: #95b4dd;
  color: white;
  border: none;
  border-radius: 8px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  ${({ theme }) => theme.fonts.Body5};
`;

const OptionButton = styled.button`
  padding: 0.2rem 0.5rem;
  background-color: #a6acd7;
  color: white;
  border: none;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body5};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #898eb0;
  }
`;

const ChatBotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 80%;
  border-radius: 16px;
  white-space: pre-wrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.2rem;
  box-sizing: border-box;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  padding-bottom: 2rem;

  /* position: absolute;
  bottom: 0; */
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem;
  font-size: 1.4rem;
  border: 1px solid #ccc;
  border-radius: 2rem;
  outline: none;
  margin-right: 1rem;
`;

const SendButton = styled.button`
  padding: 1rem 1.4rem;
  background-color: ${({ theme }) => theme.colors.MainBlue};
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #005bb5;
  }

  img {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

export default AIChatView;
