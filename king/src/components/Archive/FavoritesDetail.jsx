import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useGetFavoriteList from '../../hooks/archive/useGetFavoriteList';
import { removeFavorite } from '../../lib/favorites';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import GoUpButton from '../common/button/GoUpButton';
import Nav from '../common/Nav';
import Loading from '../Loading/Loading';
import FavoriteItem from './FavoriteItem';

const FavoritesDetail = () => {
  const { type } = useParams(); // "works" 또는 "people"
  const navigate = useNavigate();
  const lastElementRef = useRef(null);

  const language = getLanguage();
  const { archive: translations } = getTranslations(language);

  const { favoritesList, getNextData, isLoading, hasMore, mutate } = useGetFavoriteList(type);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  const handleBackClick = () => {
    navigate('/archive');
  };

  // 즐겨찾기 삭제 후 mutate 호출 - 목록 갱신
  const handleRemoveFavorite = async (targetId) => {
    const success = await removeFavorite(type, targetId);

    if (success) {
      await mutate(); // API를 다시 호출해서 실제 서버 데이터를 반영
    }
  };

  const translatedType = type === 'works' ? translations.works : translations.people;

  if (isLoading && favoritesList.length === 0) return <Loading />;

  return (
    <StFavoritesDetailWrapper>
      <St.FixedContainer>
        <St.Header>Archive</St.Header>
        <St.Title>
          <BackButton onBack={handleBackClick} />
          <St.Label>{translations.showAll.replace('{type}', translatedType)}</St.Label>
        </St.Title>
      </St.FixedContainer>
      <St.List>
        {favoritesList.length > 0 ? (
          favoritesList.map((item, index) => (
            <FavoriteItem
              key={index}
              item={item}
              type={type}
              ref={index === favoritesList.length - 1 ? lastElementRef : null}
              onRemove={handleRemoveFavorite}
            />
          ))
        ) : (
          <St.NoDataMessage>
            {translations.noFavorites.replace('{type}', translatedType)}
          </St.NoDataMessage>
        )}
      </St.List>
      <GoUpButton />
      <Nav />
    </StFavoritesDetailWrapper>
  );
};

export default FavoritesDetail;

const StFavoritesDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const St = {
  FixedContainer: styled.div`
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: ${({ theme }) => theme.colors.White};
  `,

  Header: styled.header`
    background-color: ${({ theme }) => theme.colors.White};
    padding: 3rem 3rem 1rem 3rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,

  Title: styled.div`
    display: flex;
    align-items: center;
    padding: 1rem 2rem 1rem 1.5rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  `,
  Label: styled.div`
    ${({ theme }) => theme.fonts.Title5};
    padding-bottom: 0.3rem;
  `,

  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-y: auto;
    justify-content: center;
    align-items: center;
    gap: 0;

    padding: 0rem 2rem 6rem 2rem;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
  NoDataMessage: styled.div`
    text-align: center;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body5};
    padding: 2rem;
  `,
  LoadingMessage: styled.div`
    text-align: center;
    padding: 2rem;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body5};
  `,
};

const CustomGoUpButton = styled(GoUpButton)`
  bottom: 1rem;
`;
