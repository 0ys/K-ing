import React, { useState } from 'react';
import styled from 'styled-components';

import RouteIcon from '/src/assets/icons/route.png';
import ShareIcon from '/src/assets/icons/send-outline.png';

import useModal from '../../hooks/common/useModal';
import ShareModal from '../common/modal/ShareModal';
import DeepLinkModal from './Modal/DeepLinkModal';

const FunctionButton = ({ dest }) => {
  const link = useModal();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const openShareModal = () => {
    setIsShareModalVisible(true);
  };

  const closeShareModal = () => {
    setIsShareModalVisible(false);
  };

  return (
    <ButtonContainer>
      <DirectionButton onClick={link.toggle}>
        <img src={RouteIcon} alt="FindRoute" />
        길찾기
      </DirectionButton>

      {/* 길찾기 모달 */}
      <DeepLinkModal dest={dest} isModalVisible={link.isShowing} onClick={link.toggle} />

      <ShareButton onClick={openShareModal}>
        <img src={ShareIcon} alt="Share" />
        공유
      </ShareButton>

      {/* 공유 모달 */}
      <ShareModal isModalVisible={isShareModalVisible} onClick={closeShareModal} />
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const DirectionButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.MainBlue};
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-width: 7rem;
  height: 3.4rem;
  white-space: nowrap;
  padding: 1.2rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray1};
  }

  img {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const ShareButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.Gray5};
  color: ${({ theme }) => theme.colors.Gray0};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-width: 7rem;
  height: 3.4rem;
  white-space: nowrap;
  padding: 1.2rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray3};
  }

  img {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

export default FunctionButton;
