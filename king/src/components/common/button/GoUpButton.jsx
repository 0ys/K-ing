import React from 'react';
import styled from 'styled-components';

import UpButton from '/src/assets/icons/ic_up.png';

const GoUpButton = ({ className }) => {
  const handleScrollUp = () => {
    document.querySelector('html').scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ButtonWrapper onClick={handleScrollUp} className={className}>
        <img src={UpButton} alt="up" />
      </ButtonWrapper>
    </>
  );
};

export default GoUpButton;

const ButtonWrapper = styled.button.attrs((props) => ({ className: props.className }))`
  display: flex;
  align-items: center;
  justify-content: center;

  position: fixed;
  bottom: 9rem;
  right: 3rem;

  background-color: #fff;
  border-radius: 5rem;

  width: 4rem;
  height: 4rem;

  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  z-index: 1000;

  img {
    width: 4rem;
    height: 4rem;
    object-fit: contain;
  }
`;
