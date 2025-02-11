import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { deleteAccount } from '../../lib/auth';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import SettingHeader from './SettingHeader';

const SettingDeleteAccount = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false); // 체크박스 상태 추가
  const [language, setLanguage] = useState(getLanguage());
  const { deleteAccount: deleteAccountTranslations } = getTranslations(language);

  // 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const handleDeleteAccount = async () => {
    if (!window.confirm(deleteAccountTranslations.deleteWarningMessage)) return;

    const result = await deleteAccount();

    if (result.success) {
      alert(result.message);
      navigate('/'); // 계정 삭제 후 홈으로 이동
    } else {
      alert(result.message);
    }
  };

  return (
    <StDeleteAccountWrapper>
      <SettingHeader title={deleteAccountTranslations.deleteAccount} />
      <St.ContentWrapper>
        <St.QuestionText>{deleteAccountTranslations.deleteWarningTitle}</St.QuestionText>
        <St.WarningBox>{deleteAccountTranslations.deleteWarningMessage}</St.WarningBox>

        <St.CheckboxWrapper>
          <St.Checkbox
            type="checkbox"
            id="confirmCheck"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
          />
          <St.CheckboxLabel htmlFor="confirmCheck">
            {deleteAccountTranslations.confirmCheck}
          </St.CheckboxLabel>
        </St.CheckboxWrapper>
      </St.ContentWrapper>

      <St.ButtonWrapper>
        <St.DeleteButton onClick={handleDeleteAccount} disabled={!checked}>
          {deleteAccountTranslations.deleteAccount}
        </St.DeleteButton>
      </St.ButtonWrapper>
    </StDeleteAccountWrapper>
  );
};

export default SettingDeleteAccount;

const StDeleteAccountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const St = {
  ContentWrapper: styled.div`
    padding: 1rem 4rem 0rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,
  QuestionText: styled.p`
    ${({ theme }) => theme.fonts.Title4};
    padding: 1rem 0 0.5rem 0;
  `,
  WarningBox: styled.div`
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.colors.Gray5};
    color: ${({ theme }) => theme.colors.Red};
    ${({ theme }) => theme.fonts.Body2}
  `,
  CheckboxWrapper: styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.5rem;
  `,
  Checkbox: styled.input`
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
  `,
  CheckboxLabel: styled.label`
    ${({ theme }) => theme.fonts.Body2}
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
  `,
  ButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding-bottom: 2rem;
  `,
  DeleteButton: styled.button`
    width: 90%;
    padding: 1.2rem;
    ${({ theme }) => theme.fonts.Title6};
    border: 0.2rem solid ${({ theme }) => theme.colors.Red};
    background-color: transparent;
    color: ${({ theme }) => theme.colors.Red};
    border-radius: 2rem;
    cursor: pointer;

    &:hover {
      background-color: ${({ theme }) => theme.colors.Red};
      color: ${({ theme }) => theme.colors.White};
    }

    /* 🔹 체크박스가 체크되지 않았을 때 비활성화 */
    &:disabled {
      background-color: ${({ theme }) => theme.colors.Gray3};
      color: ${({ theme }) => theme.colors.Gray1};
      border-color: ${({ theme }) => theme.colors.Gray3};
      cursor: not-allowed;
    }
  `,
};
