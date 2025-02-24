import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  IcArchive,
  IcArchiveSelected,
  IcChatbot,
  IcChatbotSelected,
  IcHome,
  IcHomeSelected,
  IcMypage,
  IcMypageSelected,
  IcUpload,
  IcUploadSelected,
} from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import UploadModal from '../Upload/Modal/UploadModal';

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const upload = useModal();

  const [selectedButton, setSelectedButton] = useState(location.pathname);

  const setButton = (pathname) => {
    if (pathname == '/curation' || pathname == '/feed') {
      return '/home';
    }
    return pathname;
  };

  const handleButtonClick = (buttonName) => {
    navigate(`/${buttonName}`);
    setSelectedButton(`/${buttonName}`);
  };

  const handleUploadClick = () => {
    upload.toggle();
  };

  const handleMyPageClick = () => {
    const userId = getUserIdFromToken();
    if (userId) {
      navigate(`/user/${userId}`);
      setSelectedButton(`/user/${userId}`);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    setSelectedButton(setButton(location.pathname));
  }, [location.pathname]);

  return (
    <>
      <StNavWrapper>
        <button type="button" onClick={() => handleButtonClick('home')}>
          {selectedButton === '/home' ? <IcHomeSelected /> : <IcHome />}

          <p>Home</p>
        </button>

        <button type="button" onClick={() => handleButtonClick('chatbot')}>
          {selectedButton === '/chatbot' ? <IcChatbotSelected /> : <IcChatbot />}

          <p>K-ing</p>
        </button>
        <button type="button" onClick={handleUploadClick}>
          {selectedButton === '/upload' ? <IcUploadSelected /> : <IcUpload />}

          <p>Upload</p>
        </button>
        <button type="button" onClick={() => handleButtonClick('archive')}>
          {selectedButton === '/archive' ? <IcArchiveSelected /> : <IcArchive />}

          <p>Archive</p>
        </button>
        <button type="button" onClick={handleMyPageClick}>
          {selectedButton.startsWith('/user/') ? <IcMypageSelected /> : <IcMypage />}

          <p>MyPage</p>
        </button>
      </StNavWrapper>

      <StUploadModalWrapper $showing={upload.isShowing} onClick={upload.toggle}>
        <UploadModal isShowing={upload.isShowing} />
      </StUploadModalWrapper>
    </>
  );
};

export default Nav;

const StNavWrapper = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, 1fr);

  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);

  width: 27.5rem;
  height: 5.5rem;
  padding: 0 1rem;
  margin: 0 auto;

  border-radius: 30px;

  background-color: ${({ theme }) => theme.colors.Gray1};
  & > button {
    justify-content: center;
    align-items: center;

    color: ${({ theme }) => theme.colors.White};
    ${({ theme }) => theme.fonts.Body4}

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const StUploadModalWrapper = styled.div`
  display: ${({ $showing }) => ($showing ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`;
