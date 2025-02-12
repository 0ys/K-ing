import React from 'react';
import styled from 'styled-components';

import { IcKing } from '../assets/icons';
import KingLogo from '../assets/icons/king_logo.png';
import KingLogoImsi from '../assets/icons/king_logo_imsi.png';

const SignupCompletePage = () => {
  const handleLogin = () => {
    alert(
      '다음의 실행 환경을 권장합니다.\n권장 테스트 환경 : PWA\n아이폰 : 공유 - 홈 화면에 추가\n안드로이드 : 우상단 메뉴 - 홈 화면에 추가',
    );
    window.location.href = '/home';
  };

  return (
    <StSignupCompletePageWrapper>
      {/* <St.IconWrapper>
        <IcKing />
      </St.IconWrapper> */}
      <LogoImage src={KingLogo} alt="King Logo" />
      <St.ContentWrapper>
        {/* <Title>K-ing</Title> */}
        <Message>회원가입이 완료되었습니다.</Message>
      </St.ContentWrapper>
      <St.ButtonWrapper>
        <ButtonContainer>
          <Button $primary onClick={handleLogin}>
            홈으로 가기
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

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title1}
  font-weight: bold;
  margin-bottom: 1rem;
`;

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
