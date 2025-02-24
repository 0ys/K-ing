import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { styled } from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character.png';

import { deleteCurationDraft } from '../../../lib/curation';
import { deletePostDraft } from '../../../lib/post';
import { UseDraft } from '../../../recoil/atom';
import { getLanguage, getTranslations } from '../../../util/languageUtils';
import CancelButton from '../../common/button/CancelButton';
import ConfirmButton from '../../common/button/ConfirmButton';
import SmallModal from '../../common/modal/smallModal';

const DraftModal = ({ isShowing, handleCancel }) => {
  const setUseDraft = useSetRecoilState(UseDraft);

  const [language, setLanguage] = useState(getLanguage());
  const { uploadModal: modalTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const handleConfirmDraft = () => {
    setUseDraft(true);
    handleCancel();
  };

  const handleCancelDraft = async () => {
    setUseDraft(false);
    await deletePostDraft();
    await deleteCurationDraft();
    handleCancel();
  };

  return (
    isShowing && (
      <SmallModal title={modalTranslations.draftTitle} isShowing={isShowing}>
        <StDraftModalWrapper>
          <StCommentWrapper>
            <img src={kingCharacter} />
            <p>{modalTranslations.draftBody}</p>
          </StCommentWrapper>
          <StBtnWrapper>
            <CancelButton btnName={modalTranslations.no} onClick={handleCancelDraft} />
            <ConfirmButton btnName={modalTranslations.yes} onClick={handleConfirmDraft} />
          </StBtnWrapper>
        </StDraftModalWrapper>
      </SmallModal>
    )
  );
};

export default DraftModal;

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
