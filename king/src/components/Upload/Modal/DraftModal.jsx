import { useSetRecoilState } from 'recoil';
import { styled } from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character.png';

import { deletePostDraft } from '../../../lib/post';
import { UseDraft } from '../../../recoil/atom';
import CancelButton from '../../common/button/CancelButton';
import ConfirmButton from '../../common/button/ConfirmButton';
import SmallModal from '../../common/modal/smallModal';

const DraftModal = ({ isShowing, handleCancel }) => {
  const setUseDraft = useSetRecoilState(UseDraft);

  const handleConfirmDraft = () => {
    setUseDraft(true);
    handleCancel();
  };

  const handleCancelDraft = async () => {
    setUseDraft(false);
    await deletePostDraft();
    handleCancel();
  };

  return (
    isShowing && (
      <SmallModal title="임시저장 불러오기" isShowing={isShowing}>
        <StDraftModalWrapper>
          <StCommentWrapper>
            <img src={kingCharacter} />
            <p>
              임시저장된 컨텐츠를 <br />
              불러오시겠습니까?
            </p>
          </StCommentWrapper>
          <StBtnWrapper>
            <CancelButton btnName="취소" onClick={handleCancelDraft} />
            <ConfirmButton btnName="확인" onClick={handleConfirmDraft} />
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
