import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { updateNotificationSetting } from '../../lib/user';
import { ProfileState } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import SettingHeader from './SettingHeader';

const SettingNotification = () => {
  const [profile, setProfile] = useRecoilState(ProfileState);
  const [language, setLanguage] = useState(getLanguage());
  const { notification: notificationTranslations = {} } = getTranslations(language);

  // 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 번역 데이터 적용
  const title = notificationTranslations.pushNotification;
  const description = notificationTranslations.pushNotificationDescription;

  const isToggled = profile.contentAlarmOn || false;

  const handleToggle = async () => {
    const newToggleState = !isToggled;

    // API 요청 (알람 설정 변경)
    const response = await updateNotificationSetting(newToggleState);

    // Recoil 상태 업데이트
    setProfile((prev) => ({
      ...prev,
      contentAlarmOn: response.data.contentAlarmOn,
    }));
  };

  return (
    <StSettingNotificationWrapper>
      <SettingHeader />
      <St.NotificationWrapper>
        <St.TextWrapper>
          <St.Title>{title}</St.Title>
          <St.Description>{description}</St.Description>
        </St.TextWrapper>

        <St.ToggleWrapper onClick={handleToggle} $isToggled={isToggled}>
          <St.ToggleBall $isToggled={isToggled} />
        </St.ToggleWrapper>
      </St.NotificationWrapper>
    </StSettingNotificationWrapper>
  );
};

export default SettingNotification;

const StSettingNotificationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  NotificationWrapper: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2.5rem;
  `,
  TextWrapper: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Title: styled.p`
    ${({ theme }) => theme.fonts.Title5};
    font-weight: bold;
  `,
  Description: styled.p`
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray2};
    margin-top: 0.5rem;
  `,
  ToggleWrapper: styled.div`
    width: 4rem;
    height: 2rem;
    background-color: ${({ theme, $isToggled }) =>
      $isToggled ? theme.colors.Gray1 : theme.colors.Gray3};
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    padding: 0.2rem;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  `,
  ToggleBall: styled.div`
    width: 1.6rem;
    height: 1.6rem;
    background-color: white;
    border-radius: 50%;
    transform: ${({ $isToggled }) => ($isToggled ? 'translateX(2rem)' : 'translateX(0)')};
    transition: transform 0.3s ease-in-out;
  `,
};
