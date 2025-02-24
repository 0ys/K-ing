import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import ErrorCharacter from '/src/assets/icons/king_character_ouch.png';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      <img src={ErrorCharacter} alt="ErrorImage" />
      <h1>4😭4 Error</h1>
      <h3>앗! 페이지가 없어요 ㅠㅠㅠ</h3>
      <p>
        요청하신 페이지가 존재하지 않거나, <br />
        이름이 변경되었거나, <br />
        일시적으로 사용이 중단되었어요.
      </p>
      <button onClick={() => navigate('/home')}>홈으로 돌아가기</button>
    </ErrorWrapper>
  );
};

export default ErrorPage;

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
