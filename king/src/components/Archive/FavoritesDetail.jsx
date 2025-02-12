import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getFavorites } from '../../lib/favorites';
import BackButton from '../common/button/BackButton';
import FavoriteItem from './FavoriteItem';

const FavoritesDetail = () => {
  const { type } = useParams(); // "works" 또는 "people"
  const navigate = useNavigate();

  const [favoritesData, setFavoritesData] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const handleBackClick = () => {
    navigate('/archive');
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const apiType = type === 'works' ? 'content' : 'cast'; // 백엔드 API에 맞게 변환
      const data = await getFavorites(apiType);
      setFavoritesData(data);
      setLoading(false);
    };

    fetchFavorites();
  }, [type]); // type이 변경될 때마다 API 호출

  if (loading) {
    return <St.LoadingMessage>데이터를 불러오는 중...</St.LoadingMessage>;
  }

  return (
    <StFavoritesDetailWrapper>
      <St.FixedContainer>
        <St.Header>Archive</St.Header>
        <St.Title>
          <BackButton onBack={handleBackClick} />
          {type === 'works' ? '작품' : '인물'} 전체보기
        </St.Title>
      </St.FixedContainer>
      <St.List>
        {favoritesData.length > 0 ? (
          favoritesData.map((item) => (
            <FavoriteItem key={item.favoriteId} item={item} type={type} />
          ))
        ) : (
          <St.NoDataMessage>
            아직 즐겨찾기한 {type === 'works' ? '작품' : '인물'}이 없어요.
          </St.NoDataMessage>
        )}
      </St.List>
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
    padding: 2rem 2rem 0 2rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,

  Title: styled.div`
    ${({ theme }) => theme.fonts.Title5};
    font-weight: bold;
    display: flex;
    align-items: center;
    padding: 1rem 2rem 1rem 1.5rem;
    gap: 0.5rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }

    background-color: ${({ theme }) => theme.colors.White};
  `,

  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    overflow-y: auto;
    padding: 0 1rem;

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
