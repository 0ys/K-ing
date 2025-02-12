import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import ErrorCharacter from '/src/assets/icons/king_character_ouch.png';

const CurationUploadPage = () => {
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      <img src={ErrorCharacter} alt="ErrorImage" />
      <h3>개발 예정인 페이지입니다! 😊</h3>

      <button onClick={() => navigate('/home')}>홈으로 돌아가기</button>
    </ErrorWrapper>
  );
};

export default CurationUploadPage;

const ErrorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
  gap: 2rem;

  img {
    width: 50%;
  }

  h1 {
    ${({ theme }) => theme.fonts.Head0}
    color:#BF2E21;
  }
  h3 {
    ${({ theme }) => theme.fonts.Title2}
  }
  p {
    ${({ theme }) => theme.fonts.Body1}
    color: ${({ theme }) => theme.colors.Gray1};
  }

  button {
    border-radius: 1rem;
    padding: 1rem 2rem;
    background-color: ${({ theme }) => theme.colors.MainBlue};
    color: ${({ theme }) => theme.colors.White};
    ${({ theme }) => theme.fonts.Title5};
  }
`;
