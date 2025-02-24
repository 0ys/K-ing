import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getLanguage, getTranslations } from '../../util/languageUtils';
import SettingItem from './SettingItem';

const SettingList = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(getLanguage());
  const { setting: settingTranslations } = getTranslations(language);

  // 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 번역 데이터 적용
  const settings = [
    { title: settingTranslations.profile, type: 'profile' },
    { title: settingTranslations.notification, type: 'notification' },
    { title: settingTranslations.language, type: 'language' },
  ];

  return (
    <StSettingListWrapper>
      {settings.map((setting) => (
        <SettingItem
          key={setting.type}
          title={setting.title}
          type={setting.type}
          onClick={() => navigate(`/setting/${setting.type}`)}
        />
      ))}
    </StSettingListWrapper>
  );
};

export default SettingList;

const StSettingListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
