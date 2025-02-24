import styled, { keyframes } from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character.png';

const UploadingModal = ({ isShowing }) => {
  return (
    isShowing && (
      <Overlay>
        <ModalBox>
          <AnimatedCharacter src={kingCharacter} alt="Uploading Character" />
          <LoadingText>수정중...</LoadingText>
        </ModalBox>
      </Overlay>
    )
  );
};

export default UploadingModal;

const slideFadeInOut = keyframes`
  0%, 100% {
    transform: translateX(-5px);
    opacity: 0.7;
  }
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: rgba(255, 255, 255, 0.8); /* 반투명한 흰색 */
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
`;

const AnimatedCharacter = styled.img`
  width: 80px;
  height: 80px;
  animation: ${slideFadeInOut} 2s ease-in-out infinite;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: black;
`;
