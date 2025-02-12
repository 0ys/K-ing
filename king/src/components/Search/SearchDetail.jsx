import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import useGetSearchResult from '../../hooks/search/useGetSearchResult';
import { SearchQueryState } from '../../recoil/atom';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getContentTypeKor } from '../../util/getContentType';
import BackButton from '../common/button/BackButton';
import Loading from '../Loading/Loading';
import SearchItem from './SearchItem';

const SearchDetail = () => {
  const genres = [
    { id: 'drama', name: '드라마', value: 'DRAMA' },
    { id: 'movie', name: '영화', value: 'MOVIE' },
    { id: 'show', name: '예능', value: 'SHOW' },
  ];

  const { type } = useParams();
  const lastElementRef = useRef(null);
  const [searchCategory, setSearchCategory] = useState(
    type === 'content' ? 'DRAMA' : type.toUpperCase(),
  );

  const searchQuery = useRecoilValue(SearchQueryState);

  const handleGenreChange = (event) => {
    setSearchCategory(event.target.value);
  };

  const { searchResultList, getNextData, isLoading, hasMore } = useGetSearchResult(
    searchQuery,
    searchCategory,
    'createdAt',
  );

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && searchResultList.length === 0) return <Loading />;

  return (
    <StFavoritesDetailWrapper>
      <St.FixedContainer>
        <St.Title>
          <BackButton />
          {getContentTypeKor(type)} 전체보기
        </St.Title>
        {type === 'content' && (
          <ContentGenreWrapper>
            {genres.map((genre) => (
              <Label key={genre.id}>
                <RadioButton
                  type="radio"
                  value={genre.value}
                  name="genre"
                  checked={searchCategory === genre.value}
                  onChange={handleGenreChange}
                />
                {genre.name}
              </Label>
            ))}
          </ContentGenreWrapper>
        )}
      </St.FixedContainer>
      {searchResultList.length > 0 ? (
        <St.List>
          {searchResultList.map((item, index) => (
            <SearchItem
              ref={index === searchResultList.length - 1 ? lastElementRef : null}
              key={item.id}
              item={item}
              type={type}
            />
          ))}
        </St.List>
      ) : (
        <NoDataMessage>검색 결과가 없습니다. 🥲</NoDataMessage>
      )}
    </StFavoritesDetailWrapper>
  );
};

export default SearchDetail;

const StFavoritesDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-top: 0;
`;

const St = {
  FixedContainer: styled.div`
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: ${({ theme }) => theme.colors.White};

    padding: 1rem 0;
    padding-top: 3rem;
  `,

  Title: styled.div`
    ${({ theme }) => theme.fonts.Title3};
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }

    background-color: ${({ theme }) => theme.colors.White};
  `,

  List: styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
};

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;

  height: 50rem;

  ${({ theme }) => theme.fonts.Body1};
  color: ${({ theme }) => theme.colors.Gray2};
`;

const ContentGenreWrapper = styled.div`
  padding: 1rem 3rem;
  padding-bottom: 0;
`;

const Label = styled.label`
  margin-right: 2rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body1};
`;

const RadioButton = styled.input`
  margin-right: 1rem;
`;
