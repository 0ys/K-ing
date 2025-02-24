import React from 'react';
import { styled } from 'styled-components';

const SmallModal = ({ title, isShowing, children }) => {
  return (
    isShowing && (
      <StSmallModalWrapper>
        <StTitle>{title}</StTitle>
        {children}
      </StSmallModalWrapper>
    )
  );
};

export default SmallModal;

const StSmallModalWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 30rem;
  height: fit-content;

  border-radius: 2rem;
  box-shadow:
    0px 4px 100px 0px rgba(153, 133, 254, 0.2) inset,
    -30px 30px 100px 0px rgba(132, 139, 227, 0.15);
  background-color: #e8e8f4;
`;

const StTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 4rem;

  border-radius: 2rem 2rem 0 0;
  background-color: ${({ theme }) => theme.colors.Navy};
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.Title4};
`;
