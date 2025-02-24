import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useModal from '../../../hooks/common/useModal';
import { getLanguage, getTranslations } from '../../../util/languageUtils';
import CopyLinkModal from './CopyLinkModal';

const ShareModal = ({ isModalVisible, onClick, curationId }) => {
  const [language, setLanguage] = useState(getLanguage());
  const { curation: curationTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const copy = useModal();

  const handleShareLink = () => {
    onClick();
    copy.setShowing(true);
  };

  return (
    <>
      <ModalBackground $isVisible={isModalVisible} onClick={onClick} />

      <ModalContainer $isVisible={isModalVisible}>
        <OptionButton onClick={handleShareLink}>{curationTranslations.shareModal}</OptionButton>
        {/* <OptionButton>앱 공유하기</OptionButton> */}
      </ModalContainer>
      <StCopyLinkModalWrapper $showing={copy.isShowing}>
        <CopyLinkModal
          curationId={curationId}
          isShowing={copy.isShowing}
          closeModal={() => copy.setShowing(false)}
        />
      </StCopyLinkModalWrapper>
    </>
  );
};

export default ShareModal;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: ${(props) => (props.$isVisible ? 'block' : 'none')};
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  background-color: #f8f8f8;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 3rem;
  box-shadow: 0px -2px 15px rgba(0, 0, 0, 0.1);
  z-index: 1010;
  display: ${({ $isVisible }) => ($isVisible ? 'block' : 'none')};
  animation: ${({ $isVisible }) =>
    $isVisible ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out'};

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }
`;

const OptionButton = styled.div`
  ${({ theme }) => theme.fonts.Body2};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.6rem;
  background-color: white;
  border-radius: 16px;
  margin-bottom: 0.6rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(238, 238, 238);
  }

  img {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const StCopyLinkModalWrapper = styled.div`
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
