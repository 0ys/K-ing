import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import useGetPlaceSearchResult from '../../hooks/search/useGetPlaceSearchResult';
import { CurationDraftExist, CurationPlaceUploadList, UseDraft } from '../../recoil/atom';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import SearchBar from '../common/SearchBar';

const CurationPlaceSearch = () => {
  const navigate = useNavigate();
  const lastElementRef = useRef(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [CurationPlaceList, setCurationPlaceList] = useRecoilState(CurationPlaceUploadList);

  const { placeList, getNextData, isLoading, hasMore } = useGetPlaceSearchResult({
    query: searchQuery,
    category: 'PLACE',
  });
  const setCurationDraftExist = useSetRecoilState(CurationDraftExist);
  const setUseDraft = useSetRecoilState(UseDraft);

  const [language, setLanguage] = useState(getLanguage());
  const { curation: curationTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (CurationPlaceList.length > 0) {
      setSelectedPlaces(
        CurationPlaceList.map((place) => ({
          id: place.placeId,
          name: place.name,
          imageUrl: place.imageUrl,
        })),
      );
    }
  }, [CurationPlaceList]);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  const handleOptionClick = (option) => {
    setSearchQuery(option.name);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePlaceChange = (item) => {
    setSelectedPlaces((prevPlaces) => {
      const index = prevPlaces.findIndex((place) => place.id === item.id);

      if (index < 0) {
        // 장소가 없으면 추가
        return [...prevPlaces, item];
      }
      // 이미 선택된 경우, 해제 (즉, 제거)
      return prevPlaces.filter((place) => place.id !== item.id);
    });
  };

  const handleRemovePlace = (id) => {
    setSelectedPlaces(selectedPlaces.filter((place) => place.id !== id));
  };

  const handleComplete = () => {
    setCurationPlaceList(
      selectedPlaces.map((place) => ({
        placeId: place.id,
        name: place.name,
        imageUrl: place.imageUrl,
      })),
    );
    setCurationDraftExist(false);
    setUseDraft(true);

    navigate(-1);
  };

  return (
    <>
      <StWrapper>
        <TopContainer>
          <IconText>
            <p onClick={handleComplete}>{curationTranslations.complete}</p>
          </IconText>
          <h3>{curationTranslations.selectedPlace}</h3>
          <SelectedPlaces>
            {selectedPlaces.map((place) => (
              <PlaceItem key={place.id}>
                <img src={place.imageUrl} alt={place.name} />
                <p>{place.name}</p>
                <button onClick={() => handleRemovePlace(place.id)}>X</button>
              </PlaceItem>
            ))}
          </SelectedPlaces>

          <SearchBar
            type={'PLACE'}
            query={searchQuery}
            onSet={handleOptionClick}
            onSearch={handleSearch}
          />
        </TopContainer>

        <SearchPlaceWrapper>
          {placeList.map((place, index) => (
            <ShowItem key={place.id} ref={index === placeList.length - 1 ? lastElementRef : null}>
              <img src={place.imageUrl} alt="place" />
              <p>{place.name}</p>
              <input
                type="checkbox"
                checked={selectedPlaces.some((p) => p.id === place.id)}
                onChange={(event) => handlePlaceChange(place, event)}
              />
            </ShowItem>
          ))}
        </SearchPlaceWrapper>
      </StWrapper>
    </>
  );
};

export default CurationPlaceSearch;

const StWrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  h3 {
    margin-bottom: 1rem;
    ${({ theme }) => theme.fonts.Title5};
    color: ${({ theme }) => theme.colors.Gray1};
  }
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  gap: 0.7rem;

  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;

  p {
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    cursor: pointer;
  }
`;

const TopContainer = styled.div``;

const SelectedPlaces = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;

  min-height: 5rem;
  overflow-x: auto; /* 가로 스크롤 가능 */
  white-space: nowrap; /* 아이템 줄바꿈 방지 */
  padding-bottom: 5px; /* 스크롤 숨김 효과를 위해 약간의 패딩 추가 */

  /* 스크롤 바 숨기기 */
  &::-webkit-scrollbar {
    display: none; /* 크롬, 사파리 */
  }
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.5rem 0;

  position: relative;

  img {
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
    object-fit: cover;
    object-position: center;
  }

  p {
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray1};
    /* 글자 제한 스타일 */
    white-space: nowrap; /* 줄바꿈 방지 */
    overflow: hidden; /* 넘치는 글자 숨김 */
    text-overflow: ellipsis; /* 말줄임(...) 표시 */
    max-width: 5rem; /* 5글자 정도까지만 보이도록 설정 */
  }

  button {
    position: absolute;
    right: -5px;
    top: -5px;

    width: 1.5rem;
    height: 1.5rem;

    border: none;
    text-align: center;
    cursor: pointer;

    background-color: ${({ theme }) => theme.colors.Gray0};
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.White};
    ${({ theme }) => theme.fonts.Body6};
  }
`;
const ShowItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.5rem 0;

  img {
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
    object-fit: cover;
    object-position: center;
  }

  p {
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray1};
  }

  button {
    width: 3rem;
    height: 3rem;
    border: none;
    cursor: pointer;

    background-color: black;
    border-radius: 10rem;
    color: ${({ theme }) => theme.colors.White};
  }
`;

const SearchPlaceWrapper = styled.div`
  overflow-y: auto;
  padding: 0rem 2rem;
  box-sizing: border-box;
`;
