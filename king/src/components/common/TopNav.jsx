import React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TopNav = () => {
  const location = useLocation();
  const [selectedButton, setSelectedButton] = useState(location.pathname);
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setSelectedButton(`/${buttonName}`);
    navigate(`/${buttonName}`);
  };

  return (
    <StNavWrapper $selectedButton={selectedButton}>
      <StyledButton selected={selectedButton === '/home'} onClick={() => handleButtonClick('home')}>
        Trend
      </StyledButton>
      <StyledButton
        selected={selectedButton === '/curation'}
        onClick={() => handleButtonClick('curation')}
      >
        Curation
      </StyledButton>
      <StyledButton selected={selectedButton === '/feed'} onClick={() => handleButtonClick('feed')}>
        Feed
      </StyledButton>
    </StNavWrapper>
  );
};

export default TopNav;

const StNavWrapper = styled.nav`
  display: flex;
  justify-content: flex-start;
  gap: 0.5rem;

  width: 321px;
  padding: 0 1rem;
  margin: 1rem 0;

  border-radius: 30px;
  background-color: ${({ theme }) => theme.colors.White};
`;

const StyledButton = styled.button`
  color: ${({ selected, theme }) => (selected ? theme.colors.Gray0 : theme.colors.Gray2)};
  ${({ theme, selected }) => theme.fonts.Title4}
  border: none;
  background: none;
  cursor: pointer;

  border-bottom: ${({ selected, theme }) =>
    selected ? `2px solid ${theme.colors.Gray0}` : 'none'};
`;
