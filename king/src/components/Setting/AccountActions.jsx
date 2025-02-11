import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { logout } from '../../lib/auth';
import { getLanguage, getTranslations } from '../../util/languageUtils';

const AccountActions = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(getLanguage());
  const { account: accountTranslations } = getTranslations(language);

  // 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      localStorage.removeItem('accessToken');
      window.location.replace('/');
    } else {
      alert(accountTranslations.logoutError);
    }
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    navigate('/setting/delete-account');
  };

  return (
    <StActionsWrapper>
      <StLogoutButton onClick={handleLogout}>{accountTranslations.logout}</StLogoutButton>
      <StDeleteAccountButton onClick={handleDeleteAccount}>
        {accountTranslations.deleteAccount}
      </StDeleteAccountButton>
    </StActionsWrapper>
  );
};

export default AccountActions;

const StActionsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3.5rem;
  margin-top: auto; /* 하단에 고정 */
`;

const StLogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body2}

  &:hover {
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const StDeleteAccountButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body2}

  &:hover {
    color: ${({ theme }) => theme.colors.Red};
  }
`;
