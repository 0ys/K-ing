import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character_sorry.png';

import { getLanguage, getTranslations } from '../../../util/languageUtils';
import CancelButton from '../../common/button/CancelButton';
import ConfirmButton from '../../common/button/ConfirmButton';
import SmallModal from '../../common/modal/smallModal';

const DeleteModal = ({ isShowing, onClose, onConfirm }) => {
  const [language, setLanguage] = useState(getLanguage());
  const { uploadModal: modalTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  return (
    isShowing && (
      <SmallModal title={modalTranslations.deleteTitle} isShowing={isShowing}>
        <StDraftModalWrapper>
          <StCommentWrapper>
            <img src={kingCharacter} />
            <p>{modalTranslations.deleteBody}</p>
          </StCommentWrapper>
          <StBtnWrapper>
            <CancelButton btnName={modalTranslations.no} onClick={onClose} />
            <ConfirmButton btnName={modalTranslations.yes} onClick={onConfirm} />
          </StBtnWrapper>
        </StDraftModalWrapper>
      </SmallModal>
    )
  );
};

export default DeleteModal;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;

  p {
    ${({ theme }) => theme.fonts.Body2};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 10px;
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
  }

  button:first-child {
    background: ${({ theme }) => theme.colors.Red};
    color: white;
  }

  button:last-child {
    background: ${({ theme }) => theme.colors.Gray1};
    color: white;
  }
`;

const StDraftModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 1.5rem 2rem;
`;

const StCommentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  margin: 1rem;

  img {
    width: 7rem;
  }

  & > p {
    margin-left: 2rem;

    color: ${({ theme }) => theme.colors.Gray1};
    ${({ theme }) => theme.fonts.Body1};
  }
`;
const StBtnWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;
