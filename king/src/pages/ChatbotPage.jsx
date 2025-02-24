import React from 'react';
import styled from 'styled-components';

import AIChatView from '../components/AI/AIChatView';

const ChatbotPage = () => {
  return (
    <>
      <AIChatView />
    </>
  );
};

export default ChatbotPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
