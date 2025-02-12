import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import GoogleIcon from '../../assets/icons/ic_google.png';
import LineIcon from '../../assets/icons/ic_line_88.png';
import KingLogo from '../../assets/icons/king_logo.png';

const Landing = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const googleLogin = () => {
    window.location.href = API_BASE_URL + '/oauth2/authorization/google';
  };

  const handleMasterToken = () => {
    let accessToken = import.meta.env.VITE_MASTER_ACCESS_TOKEN;
    localStorage.setItem('accessToken', accessToken);
    alert(
      '다음의 실행 환경을 권장합니다.\n권장 테스트 환경 : PWA\n아이폰 : 공유 - 홈 화면에 추가\n안드로이드 : 우상단 메뉴 - 홈 화면에 추가',
    );
    navigate('/home');
  };

  return (
    <StLandingWrapper>
      <St.ContentWrapper>
        <St.TaglineWrapper>
          <St.Tagline>드라마의 발자취를 따라 주인공이 되어보세요.</St.Tagline>
          <St.Title>촬영 배경지 큐레이션 서비스</St.Title>
        </St.TaglineWrapper>
        <St.LogoImage src={KingLogo} alt="King Logo" />
      </St.ContentWrapper>

      <St.ButtonWrapper>
        <St.SocialButton onClick={handleMasterToken}>Master login</St.SocialButton>
        <St.SocialButton $google onClick={googleLogin}>
          <img src={GoogleIcon} alt="구글 아이콘" />
          Continue with Google
        </St.SocialButton>
        {/* <St.SocialButton $line>
          <img src={LineIcon} alt="라인 아이콘" />
          Continue with LINE
        </St.SocialButton> */}
      </St.ButtonWrapper>
    </StLandingWrapper>
  );
};

export default Landing;

const StLandingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5rem;
  position: relative;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.8rem; /* 아이콘과 텍스트 사이 간격 */
    margin-top: 15%; /* 화면의 중앙에 가까운 위치 */
  `,
  IconWrapper: styled.div`
    font-size: 4rem;
  `,
  TaglineWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem; /* 줄 간격 */
  `,
  FootprintWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  ButtonWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 30rem; /* 버튼의 최대 너비 제한 */
  `,
  Tagline: styled.p`
    ${({ theme }) => theme.fonts.Body4}
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
  `,
  Title: styled.h1`
    ${({ theme }) => theme.fonts.Title2}
    font-weight: bold;
    text-align: center;
  `,
  SocialButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px 20px; /* 왼쪽 여백 추가 */
    width: 100%;
    height: 4.5rem;
    line-height: 4.5rem;
    max-width: 300px;
    border: none;
    border-radius: 5px;
    font-size: ${({ theme }) => theme.fonts.Body3};
    cursor: pointer;

    background-color: ${({ $google }) => ($google ? '#F2F2F2' : '#00C300')};
    color: ${({ $google }) => ($google ? '#1F1F1F' : '#FFFFFF')};

    img {
      width: 3rem;
      height: 3rem;
    }

    &:hover {
      opacity: 0.9;
    }
  `,

  LogoImage: styled.img`
    width: 200px;
    height: auto;
    position: relative; /* 요소를 독립적으로 배치하기 위해 */
    z-index: 2; /* 발자국보다 앞에 배치 */
  `,
};
