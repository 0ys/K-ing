import React from 'react';
import styled from 'styled-components';

import KingLogo from '../assets/icons/king_logo.png';
import { handleAllowNotification } from '../service/handleAllowNotification';
import { getLanguage, getTranslations } from '../util/languageUtils';

const SignupCompletePage = () => {
  const language = getLanguage();
  const { common: translations } = getTranslations(language);

  const handleLogin = async () => {
    await handleAllowNotification();
    window.location.href = '/home';
  };

  return (
    <StSignupCompletePageWrapper>
      <LogoImage src={KingLogo} alt="King Logo" />
      <St.ContentWrapper>
        <Message>{translations.signup_complete}</Message>
      </St.ContentWrapper>
      <St.ButtonWrapper>
        <ButtonContainer>
          <Button $primary onClick={handleLogin}>
            {translations.go_home}
          </Button>
        </ButtonContainer>
      </St.ButtonWrapper>
    </StSignupCompletePageWrapper>
  );
};

export default SignupCompletePage;

const StSignupCompletePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 35rem;
    padding: 0 2rem;
    gap: 2rem;
  `,
  ButtonWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 30rem;
  `,
  IconWrapper: styled.div`
    ${({ theme }) => theme.fonts.Title2}
  `,
};

const Message = styled.p`
  ${({ theme }) => theme.fonts.Title3}
  text-align: center;
  color: ${({ theme }) => theme.colors.Gray0};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const Button = styled.button`
  flex: 1;
  padding: 1.2rem;
  ${({ theme }) => theme.fonts.Title4}
  font-weight: bold;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;

  background-color: ${({ $primary, theme }) =>
    $primary ? theme.colors.MainBlue : theme.colors.Gray2};
  color: ${({ $primary, theme }) => ($primary ? theme.colors.White : theme.colors.Gray0)};

  &:hover {
    opacity: 0.8;
  }
`;

const LogoImage = styled.img`
  width: 15rem;
  height: auto;
  position: relative; /* 요소를 독립적으로 배치하기 위해 */
  z-index: 2; /* 발자국보다 앞에 배치 */
`;
