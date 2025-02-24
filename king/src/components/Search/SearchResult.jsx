import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import useGetSearchResult from '../../hooks/search/useGetSearchResult';
import {
  FilterOption,
  PlaceSearchQueryState,
  SearchCategoryState,
  SearchPrevQuery,
  SearchQueryState,
} from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils'; // ✅ 번역 유틸 추가
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import Loading from '../Loading/Loading';
import SearchList from './SearchList';

const SearchResult = () => {
  const language = getLanguage();
  const { common } = getTranslations(language);

  const setPrevQuery = useSetRecoilState(SearchPrevQuery);
  const [searchQuery, setSearchQuery] = useRecoilState(SearchQueryState);
  const [searchCategory, setSearchCategory] = useRecoilState(SearchCategoryState);
  const setFilter = useSetRecoilState(FilterOption);
  const placeQueryState = useRecoilValue(PlaceSearchQueryState);

  const { searchResultList, isLoading } = useGetSearchResult(searchQuery, searchCategory, '');

  const [contentList, setContentList] = useState([]);
  const [celebList, setCelebList] = useState([]);
  const [placeList, setPlaceList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (placeQueryState) {
      setSearchQuery(placeQueryState);
    }
  }, [placeQueryState, setSearchQuery]);

  const handleSearch = (query, category) => {
    setFilter({
      categories: {
        RESTAURANT: false,
        CAFE: false,
        PLAYGROUND: false,
        STORE: false,
        STAY: false,
      },
      province: '',
      district: '',
    });
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
        searchResultList?.filter((item) => ['DRAMA', 'MOVIE', 'SHOW'].includes(item.category)),
      );
      setCelebList(searchResultList?.filter((item) => item.category === 'CAST'));
      setPlaceList(searchResultList?.filter((item) => item.category === 'PLACE'));
    }
  }, [isLoading]);

  if (isLoading) return <Loading />;

  return (
    <>
      <StHomeWrapper>
        <Header>
          <IconText>
            <BackButton onBack={handleGoBack} />
            <h3>{common.search}</h3>
          </IconText>
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </Header>
        <ResultWrapper>
          <SearchList title={common.content} data={contentList} type="CONTENT" />
          <SearchList title={common.person} data={celebList} type="CAST" />
          <SearchList title={common.place} data={placeList} type="PLACE" />
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
