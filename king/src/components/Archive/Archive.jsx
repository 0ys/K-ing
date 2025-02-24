import React from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { ActiveArchiveTabState } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Nav from '../common/Nav';
import ArchiveTabMenu from './ArchiveTabMenu';
import CurationsList from './CurationsList';
import FavoritesList from './FavoritesList';

const Archive = () => {
  const [activeTab, setActiveTab] = useRecoilState(ActiveArchiveTabState);
  const language = getLanguage();
  const { archive: translations } = getTranslations(language);

  return (
    <StArchiveWrapper>
      <St.Header>Archive</St.Header>
      <ArchiveTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Curations' && <CurationsList />}
      {activeTab === 'Favorites' && (
        <>
          <FavoritesList title={translations.works} onTabChange={setActiveTab} />
          <FavoritesList title={translations.people} onTabChange={setActiveTab} />
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
