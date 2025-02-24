import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcNavigateNext } from '../../assets/icons';
import { getFavorites, removeFavorite } from '../../lib/favorites';
import { convertType } from '../../util/convertType';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Loading from '../Loading/Loading';
import FavoriteItem from './FavoriteItem';

const FavoritesList = ({ title, onTabChange }) => {
  const navigate = useNavigate();
  const language = getLanguage();
  const { archive: translations } = getTranslations(language);

  const [favoritesData, setFavoritesData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const type = convertType(title === translations.works ? 'works' : 'people');
      const data = await getFavorites(type);
      setFavoritesData(data || []);
      setLoading(false);
    };
    fetchFavorites();
  }, [title]); // title이 변경될 때마다 API 호출

  // 북마크 삭제 함수
  const handleRemoveFavorite = async (targetId) => {
    const type = convertType(title === translations.works ? 'works' : 'people');
    const success = await removeFavorite(type, targetId);

    if (success) {
      // 삭제 후 리스트에서 해당 아이템 제거
      setFavoritesData((prev) => prev.filter((item) => item.targetId !== targetId));
    }
  };

  // 최대 5개까지만 렌더링
  const previewData = (favoritesData || []).slice(0, 5);

  const translatedType = title === translations.works ? translations.works : translations.people;

  // 단위 계산 ('개' 또는 '명')
  const unit = title === translations.works ? translations.unit_item : translations.unit_person;

  // 전체 문장 구성
  const countDisplay = favoritesData?.length >= 10 ? '10+' : favoritesData?.length || 0;

  const itemsCountText = translations.itemsCount
    .replace('{countDisplay}', countDisplay) // ✅ 10+ 표시
    .replace('{unit}', unit)
    .replace('{type}', title);

  const showAllText = translations.showAll.replace('{type}', translatedType);

  // 전체보기 클릭 시 이동 처리
  const handleFavoriteClick = () => {
    const type = title === translations.works ? 'works' : 'people'; // title에 따라 type 설정
    onTabChange('Favorites'); // activeTab을 Favorites로 설정
    navigate(`/favorites/${type}`, { state: { type } });
  };

  return (
    <StFavoritesListWrapper>
      <St.Header>
        <St.Left>
          <St.Title>{title}</St.Title>
          <St.Count>{itemsCountText}</St.Count>
        </St.Left>
        {favoritesData.length > 0 && (
          <St.ShowAllButton onClick={handleFavoriteClick}>
            {showAllText} <IcNavigateNext />
          </St.ShowAllButton>
        )}
      </St.Header>
      {loading ? (
        <Loading />
      ) : (
        <St.List>
          {favoritesData.length > 0 ? (
            <>
              {previewData.map((item) => (
                <FavoriteItem
                  key={item.favoriteId}
                  item={item}
                  type={title === translations.works ? 'works' : 'people'}
                  onRemove={handleRemoveFavorite} // prop으로 전달
                />
              ))}
            </>
          ) : (
            <St.NoDataMessage>
              {translations.noFavorites.replace('{type}', translatedType)}
            </St.NoDataMessage>
          )}
          {favoritesData.length > 3 && (
            <St.ShowAllButton2 onClick={handleFavoriteClick}>
              <IcNavigateNext />
              <br />
              {translations.showAllSimple}
            </St.ShowAllButton2>
          )}
        </St.List>
      )}
    </StFavoritesListWrapper>
  );
};

export default FavoritesList;

const StFavoritesListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const St = {
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Left: styled.div`
    display: flex;
    align-items: baseline; /* 제목과 카운트를 정렬 */
    gap: 8px; /* 제목과 카운트 간격 */
    align-items: center; /* 메시지 수직 정렬 */
  `,
  NoDataMessage: styled.div`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
    width: 100%;
    padding: 16px 0;
  `,
  LoadingMessage: styled.div`
    text-align: center;
    padding: 2rem;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body5};
  `,
  Title: styled.h2`
    ${({ theme }) => theme.fonts.Body3};
    font-weight: bold;
  `,
  Count: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    color: ${({ theme }) => theme.colors.Gray2};
  `,
  List: styled.div`
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 8px;
    min-width: 0;
    width: 100%;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
  ShowAllButton: styled.button`
    ${({ theme }) => theme.fonts.Body5};
    display: flex; /* 텍스트와 아이콘을 같은 줄에 배치 */
    align-items: center; /* 텍스트와 아이콘의 높이를 정렬 */
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
    min-width: 60px; /* 버튼 최소 너비 */
    text-align: center; /* 텍스트 가운데 정렬 */
    text-decoration: none;
    gap: 4px; /* 텍스트와 아이콘 간 간격 */

    &:hover {
      color: ${({ theme }) => theme.colors.MainBlue};
    }
  `,
  ShowAllButton2: styled.button`
    ${({ theme }) => theme.fonts.Body5};
    align-items: center; /* 텍스트와 아이콘의 높이를 정렬 */
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
    min-width: 60px;
    text-align: center; /* 텍스트 가운데 정렬 */
    text-decoration: none;
    gap: 4px; /* 텍스트와 아이콘 간 간격 */
  `,
};
