import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import useGetSearchResult from '../../hooks/search/useGetSearchResult';
import { SearchCategoryState, SearchPrevQuery, SearchQueryState } from '../../recoil/atom';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import Loading from '../Loading/Loading';
import SearchList from './SearchList';

const SearchResult = () => {
  const setPrevQuery = useSetRecoilState(SearchPrevQuery);
  const [searchQuery, setSearchQuery] = useRecoilState(SearchQueryState);
  const [searchCategory, setSearchCategory] = useRecoilState(SearchCategoryState);

  const { searchResultList, isLoading } = useGetSearchResult(
    searchQuery,
    searchCategory,
    'createdAt',
  );

  const [contentList, setContentList] = useState([]);
  const [celebList, setCelebList] = useState([]);
  const [placeList, setPlaceList] = useState([]);

  const navigate = useNavigate();

  const handleSearch = (query, category) => {
    setSearchQuery(query);
    setSearchCategory(category);
    setPrevQuery(query);
  };

  const handleGoBack = () => {
    navigate(`/home`);
  };

  useEffect(() => {
    if (searchResultList) {
      setContentList(
        searchResultList.filter((item) => ['DRAMA', 'MOVIE', 'SHOW'].includes(item.category)),
      );
      setCelebList(searchResultList.filter((item) => item.category === 'CAST'));
      setPlaceList(searchResultList.filter((item) => item.category === 'PLACE'));
    }
  }, [isLoading]);

  if (isLoading) return <Loading />;

  return (
    <>
      <StHomeWrapper>
        <Header>
          <IconText>
            <BackButton onBack={handleGoBack} />
            <h3>통합검색</h3>
          </IconText>
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </Header>
        <ResultWrapper>
          <SearchList title="작품" data={contentList} type="CONTENT" />
          <SearchList title="인물" data={celebList} type="CAST" />
          <SearchList title="장소" data={placeList} type="PLACE" />
        </ResultWrapper>
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default SearchResult;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;
  margin-bottom: 7rem;
  padding: 2rem;
  padding-top: 0;
`;

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;

  padding-top: 2rem;
  background-color: ${({ theme }) => theme.colors.White};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  h3 {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const ResultWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 5rem;
`;
