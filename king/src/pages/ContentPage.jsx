import React from 'react';
import styled from 'styled-components';

import Content from '../components/Contents/Content';

const ContentPage = () => {
  return (
    <>
      <Content />
    </>
  );
};

export default ContentPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
