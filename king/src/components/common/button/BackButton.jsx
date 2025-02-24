import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBack } from '../../../assets/icons';

const BackButton = ({ onBack }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleClick = onBack ? onBack : handleGoBack;

  return (
    <>
      <BtnWrapper onClick={handleClick}>
        <IcBack />
      </BtnWrapper>
    </>
  );
};

export default BackButton;

const BtnWrapper = styled.button`
  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;
