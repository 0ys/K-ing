import React, { useState } from 'react';
import styled from 'styled-components';

import GoUpButton from '../common/button/GoUpButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import CurationsList from './CurationsList';

const Curation = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar query="" type="curation" onSearch={handleSearch} />
        </FixedContainer>
        <CurationWrapper>
          <CurationsList query={query} />
        </CurationWrapper>
      </StCurationWrapper>
      <GoUpButton />
      <Nav />
    </>
  );
};

export default Curation;

const StCurationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  padding-bottom: 0;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;

  background-color: ${({ theme }) => theme.colors.White};
`;

const CurationWrapper = styled.div`
  width: 100%;
`;
