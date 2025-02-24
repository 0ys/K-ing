import { styled } from 'styled-components';

const ConfirmButton = ({ btnName, onClick }) => {
  return (
    <StConfirmButtonWrapper type="button" onClick={onClick}>
      {btnName}
    </StConfirmButtonWrapper>
  );
};

export default ConfirmButton;

export const StConfirmButtonWrapper = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  width: fit-content;
  height: 3.5rem;
  padding: 1rem 2rem;

  border-radius: 1rem;
  box-shadow: 2.48px 2.48px 9.92px 1.65333px rgba(0, 0, 0, 0.16);
  background: #65a0fe;
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.Title6};
`;
