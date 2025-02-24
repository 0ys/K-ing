import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import ShareIcon from '/src/assets/icons/send-outline.png';

import { IcBookmark } from '../../assets/icons';
import { IcBookmarkFillBlack } from '../../assets/icons';
import ShareModal from '../common/modal/ShareModal';

const FunctionButton = ({ shareable, bookmarked, onBookmarkClick }) => {
  const { curationId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ButtonContainer>
      {shareable && (
        <ShareButton onClick={openModal}>
          <img src={ShareIcon} alt="Share" />
        </ShareButton>
      )}

      {/* 공유 모달 */}
      <ShareModal isModalVisible={isModalVisible} onClick={closeModal} curationId={curationId} />

      <BookmarkButton onClick={onBookmarkClick}>
        {bookmarked ? <IcBookmarkFillBlack /> : <IcBookmark />}
      </BookmarkButton>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
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
  width: 3rem;
  height: 3rem;
  white-space: nowrap;
  padding: 0.7rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray3};
  }

  img {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const BookmarkButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: auto;
  background: none;
  border: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;
export default FunctionButton;
