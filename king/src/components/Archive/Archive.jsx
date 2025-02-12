import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { CurationsDummyData } from '../../assets/dummy/dummyDataArchive';
import { ActiveArchiveTabState } from '../../recoil/atom';
import Nav from '../common/Nav';
import ArchiveTabMenu from './ArchiveTabMenu';
import CurationsList from './CurationsList';
import FavoritesList from './FavoritesList';

const Archive = () => {
  const [activeTab, setActiveTab] = useRecoilState(ActiveArchiveTabState);

  const [curationsData] = useState(CurationsDummyData);

  return (
    <StArchiveWrapper>
      <St.Header>Archive</St.Header>
      <ArchiveTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Curations' && <CurationsList data={curationsData} />}
      {activeTab === 'Favorites' && (
        <>
          <FavoritesList title="작품" onTabChange={setActiveTab} />
          <FavoritesList title="인물" onTabChange={setActiveTab} />
        </>
      )}
      <Nav />
    </StArchiveWrapper>
  );
};

export default Archive;

const StArchiveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  Header: styled.header`
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;
    padding: 3rem 3rem 1rem 3rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
