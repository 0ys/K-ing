// styled-components의 named export 정확히 사용
import styled, { keyframes } from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character.png';

import SmallModal from '../../common/modal/smallModal';

const UploadingModal = ({ isShowing }) => {
  return (
    isShowing && (
      <SmallModal title="게시글 업로드" isShowing={isShowing}>
        <StDraftModalWrapper>
          <AnimatedCharacter src={kingCharacter} alt="Uploading Character" />
          <p>업로드 중...</p>
        </StDraftModalWrapper>
      </SmallModal>
    )
  );
};

export default UploadingModal;

const StDraftModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem;

  & > p {
    margin-top: 1rem;
    color: ${({ theme }) => theme.colors.Gray1};
    font-size: ${({ theme }) => theme.fonts.Title5};
  }
`;

const slideFadeInOut = keyframes`
  0%, 100% {
    transform: translateX(-10px);
    opacity: 0.5;
  }
  50% {
    transform: translateX(10px);
    opacity: 1;
  }
`;

const AnimatedCharacter = styled.img`
  width: 100px;
  height: 100px;
  animation: ${slideFadeInOut} 3s ease-in-out infinite;
`;
