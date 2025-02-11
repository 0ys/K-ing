import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import NoResultImage from '/src/assets/icons/king_character_sorry.png';

import { IcFilter, IcMap } from '../../assets/icons';
import useGetPlaceSearchResult from '../../hooks/search/useGetPlaceSearchResult';
import { ContentId, FilterOption, SearchQueryState, SearchRelatedType } from '../../recoil/atom';
import { ScrollPosition } from '../../recoil/atom';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import BackButton from '../common/button/BackButton';
import FilterButton from '../common/button/FilterButton';
import GoUpButton from '../common/button/GoUpButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import SortingRow from '../common/SortingRow';
import PlaceCard from '../Home/PlaceCard';

const SearchKeyword = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useRecoilState(FilterOption);
  const [sortBy, setSortBy] = useState('createdAt');

  const [isProvinceActive, setIsProvinceActive] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useRecoilState(SearchQueryState);
  const [relatedType, setRelatedType] = useRecoilState(SearchRelatedType);
  const scrollPosition = useRecoilValue(ScrollPosition);
  const contentId = useRecoilValue(ContentId);

  const sortType = {
    가나다순: 'name',
    인기순: 'popularity',
    최신순: 'createdAt',
  };

  const { placeList, getNextData, isLoading, hasMore } = useGetPlaceSearchResult({
    query: searchQuery,
    category: 'PLACE',
    region: [filter.province, filter.district].filter(Boolean).join(' '),
    sortBy,
    placeTypeList: Object.keys(filter.categories).filter((key) => filter.categories[key]),
    relatedType,
  });

  const lastElementRef = useRef(null);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && initialLoading) {
      document.querySelector('html').scrollTo({ top: scrollPosition, behavior: 'smooth' });
      setInitialLoading(false);
    }
  }, [isLoading]);

  const handleToggleFilter = (filterType) => {
    setFilter((prevFilter) => {
      if (filterType === 'category') {
        return {
          ...prevFilter,
          categories: Object.keys(prevFilter.categories).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
        };
      } else if (filterType === 'province') {
        return {
          ...prevFilter,
          province: '',
          district: '',
        };
      }
      return prevFilter;
    });
  };

  useEffect(() => {
    if (filter && filter.categories) {
      setIsProvinceActive(filter.province !== '');
      setIsCategoryActive(Object.values(filter.categories).some((value) => value));
    }
  }, [filter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setRelatedType('all');
  };

  const handleSorting = (newSorting) => {
    setSortBy(sortType[newSorting]);
  };

  const handleOpenFilter = () => {
    navigate(`/search/keyword/filter`);
  };

  const handleOpenMap = () => {
    setSearchQuery(searchQuery);
    navigate(`/map`);
  };

  const handleGoBack = () => {
    setSearchQuery('');

    if (relatedType === 'cast') {
      navigate(`/content/cast/${contentId}`);
    } else {
      navigate(`/content/detail/${contentId}`);
    }
  };

  return (
    <>
      <StHomeWrapper>
        <FixedContainer>
          <IconText>
            <BackButton onBack={handleGoBack} />
            <h3> 장소 조회</h3>
          </IconText>
          <SearchBar type="PLACE" query={searchQuery || ''} onSearch={handleSearch} />
          <OptionHeader>
            <FilterWrapper>
              <FilterButton
                buttonName="필터"
                buttonIcon={IcFilter}
                onClickMethod={handleOpenFilter}
                $isActive={isProvinceActive || isCategoryActive}
              />
              <FilterButton
                buttonName="장소 유형"
                $isActive={isCategoryActive}
                onClickMethod={() => handleToggleFilter('category')}
              />
              <FilterButton
                buttonName="지역"
                $isActive={isProvinceActive}
                onClickMethod={() => handleToggleFilter('province')}
              />
            </FilterWrapper>
            <Options>
              <IcMap onClick={handleOpenMap} />
              <SortingRow onSortingChange={handleSorting} />
            </Options>
          </OptionHeader>
        </FixedContainer>
        {placeList.length > 0 ? (
          <ResultWrapper>
            {placeList.map((card, index) => (
              <PlaceCard
                key={index}
                place={card}
                ref={index === placeList.length - 1 ? lastElementRef : null}
              />
            ))}
          </ResultWrapper>
        ) : (
          <NoResultsMessage>
            <img src={NoResultImage} alt="검색 결과가 없습니다." />
            검색 결과가 없습니다.😭😭
          </NoResultsMessage>
        )}

        <GoUpButton />
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default SearchKeyword;

const StHomeWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

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
const OptionHeader = styled.div`
  width: 100%;
`;

const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin: 0.5rem;

  svg {
    cursor: pointer;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  gap: 0.5rem;

  margin-bottom: 1rem;
`;

const ResultWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  width: 100%;
  padding-bottom: 1rem;

  /* overflow-y: auto; */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NoResultsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  width: 100%;
  text-align: center;

  padding: 7rem 0;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body1};

  img {
    width: 60%;
  }
`;
