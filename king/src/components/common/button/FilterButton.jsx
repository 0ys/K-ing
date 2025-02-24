import React from 'react';
import styled from 'styled-components';

const FilterButton = ({ buttonName, buttonIcon: Icon, onClickMethod, $isActive }) => {
  return (
    <ButtonWrapper onClick={onClickMethod} $isActive={$isActive} name={buttonName}>
      {Icon && <Icon />}
      {buttonName}
      {buttonName === '필터' && $isActive && <ActiveIndicator />}
    </ButtonWrapper>
  );
};
export default FilterButton;

const ButtonWrapper = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  padding: 0.7rem 1rem;
  width: fit-content;

  border-radius: 10px;
  background-color: ${({ theme, $isActive, name }) =>
    $isActive && name !== '필터' ? theme.colors.MainBlue : theme.colors.White};
  color: ${({ theme, $isActive, name }) =>
    $isActive && name !== '필터' ? theme.colors.White : theme.colors.Gray0};
`;

const ActiveIndicator = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: red;
  border: 2px solid ${({ theme }) => theme.colors.White};
`;
