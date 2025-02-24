import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import SettingDeleteAccount from './SettingDeleteAccount';
import SettingLanguage from './SettingLanguage';
import SettingNotification from './SettingNotification';
import SettingProfile from './SettingProfile';

const SettingDetail = () => {
  const { settingType } = useParams();

  const renderSettingComponent = () => {
    switch (settingType) {
      case 'profile':
        return <SettingProfile />;
      case 'delete-account':
        return <SettingDeleteAccount />;
      case 'notification':
        return <SettingNotification />;
      case 'language':
        return <SettingLanguage />;
      default:
        return <div>잘못된 접근입니다.</div>;
    }
  };

  return <StSettingDetailWrapper>{renderSettingComponent()}</StSettingDetailWrapper>;
};

export default SettingDetail;

const StSettingDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
