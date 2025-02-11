import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getLanguage, getTranslations } from '../../util/languageUtils';
import AccountActions from './AccountActions';
import SettingHeader from './SettingHeader';
import SettingList from './SettingList';

const Setting = () => {
  const [language, setLanguage] = useState(getLanguage());
  const { setting: settingTranslations } = getTranslations(language);

  // 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  return (
    <StSettingWrapper>
      <SettingHeader title={settingTranslations.setting} />
      <SettingList />
      <AccountActions />
    </StSettingWrapper>
  );
};

export default Setting;

const StSettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;
