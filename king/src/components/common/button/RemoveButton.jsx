import { styled } from 'styled-components';

import RemoveIcon from '../../../assets/icons/remove.png';

const RemoveButton = ({ onClick }) => {
  return (
    <StRemoveButtonWrapper
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
        onClick();
      }}
    >
      <img src={RemoveIcon} alt={'remove'} />
    </StRemoveButtonWrapper>
  );
};

export default RemoveButton;

export const StRemoveButtonWrapper = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: auto; /* 버튼만 클릭되도록 설정 */

  img {
    height: 1.8rem;
    width: 1.8rem;
    pointer-events: none; /* 이미지가 클릭되지 않도록 설정 */
  }
`;
