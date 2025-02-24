import React from 'react';
import styled from 'styled-components';

import { IcNavigateNext } from '../../assets/icons';

const SettingItem = ({ title, onClick }) => {
  return (
    <StItemWrapper onClick={onClick}>
      <St.Title>{title}</St.Title>
      <IcNavigateNext />
    </StItemWrapper>
  );
};

export default SettingItem;

const StItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
`;

const St = {
  Title: styled.div`
    padding-left: 1rem;
    ${({ theme }) => theme.fonts.Body2}
  `,
};
