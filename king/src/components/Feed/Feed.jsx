import React, { useState } from 'react';
import styled from 'styled-components';

import { IcOne, IcOneSelected, IcTwo, IcTwoSelected } from '../../assets/icons';
import GoUpButton from '../common/button/GoUpButton';
import Nav from '../common/Nav';
import TopNav from '../common/TopNav';
import FeedsList from './FeedsList';

const Feed = () => {
  const [columns, setColumns] = useState(2);

  return (
    <>
      <StFeedWrapper>
        <FixedContainer>
          <TopNav />
          <FilterWrapper>
            {columns === 1 ? (
              <IcOneSelected onClick={() => setColumns(1)} />
            ) : (
              <IcOne onClick={() => setColumns(1)} />
            )}
            {columns === 2 ? (
              <IcTwoSelected onClick={() => setColumns(2)} />
            ) : (
              <IcTwo onClick={() => setColumns(2)} />
            )}
          </FilterWrapper>
        </FixedContainer>
        <FeedsList columns={columns} />
      </StFeedWrapper>
      <GoUpButton />
      <Nav />
    </>
  );
};

export default Feed;

const StFeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  padding-top: 0;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  padding-top: 2rem;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;

  box-sizing: border-box;
  margin-bottom: 1rem;
  gap: 0.5rem;

  width: 100%;

  svg {
    cursor: pointer;
  }
`;
