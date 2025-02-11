import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';

const SettingHeader = ({ title }) => {
  const language = getLanguage();
  const { setting: settingTranslations } = getTranslations(language);
  const location = useLocation();

  const settingType = location.pathname.split('/').pop(); // URL에서 'profile', 'notification', 'language' 가져오기
  const pageTitle = title || settingTranslations[settingType] || '설정';

  return (
    <StHeaderWrapper>
      <BackButton />
      <St.Header>{pageTitle}</St.Header>
    </StHeaderWrapper>
  );
};

export default SettingHeader;

const StHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
`;

const St = {
  Header: styled.header`
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
