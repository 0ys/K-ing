import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import CloseIcon from '../../../assets/icons/close.png';

const CloseButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <>
      <ClosedButton onClick={handleGoBack}>
        <img src={CloseIcon} alt="close" />
      </ClosedButton>
    </>
  );
};

export default CloseButton;

const ClosedButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 2.5rem;
    height: 2.5rem;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;
