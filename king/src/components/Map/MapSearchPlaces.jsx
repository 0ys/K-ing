import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { IcPencil } from '../../assets/icons';
import UpIcon from '../../assets/icons/up.png';
import useGetPlaceSearchResult from '../../hooks/search/useGetPlaceSearchResult';
import { searchMapView } from '../../lib/map';
import { getPlaceDetail } from '../../lib/place';
import {
  FilterOption,
  SearchQueryState,
  SearchRegionState,
  SearchRelatedType,
} from '../../recoil/atom';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import CloseButton from '../common/button/CloseButton';
import Loading from '../Loading/Loading';
import ContentsInfo from '../PlaceDetail/ContentsInfo';
import FunctionButton from '../PlaceDetail/FunctionButton';
import PlaceInfo from '../PlaceDetail/PlaceInfo';
import FilterButtons from './FilterButtons';
import GoogleMapView from './GoogleMapView';
import ListItem from './ListItem';

const MapSearchPlaces = () => {
  const [query, setQuery] = useRecoilState(SearchQueryState);
  const [region, setRegion] = useRecoilState(SearchRegionState);
  const [filterOption, setFilterOption] = useRecoilState(FilterOption);
  const relatedType = useRecoilValue(SearchRelatedType);

  const [isExpanded, setIsExpanded] = useState(false);
  const [nowActiveMarker, setNowActiveMarker] = useState(0);
  const [places, setPlaces] = useState([]);
  const [placeId, setPlaceId] = useState(0);
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isContentExpanded, setisContentExpanded] = useState(false);
  const [displayRelatedContents, setdisplayRelatedContents] = useState([]);
  const [boundingBox, setBoundingBox] = useState({
    swLat: 0.0,
    swLng: 0.0,
    neLat: 0.0,
    neLng: 0.0,
  });

  const filters = ['RESTAURANT', 'CAFE', 'PLAYGROUND', 'STORE', 'STAY'];
  const [language, setLanguage] = useState(getLanguage());
  const { map: mapTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await searchMapView(query, region, relatedType, boundingBox);
        setPlaces(data);
        setFilteredPlaces(data);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [boundingBox]);

  const { placeList, getNextData, isLoading, hasMore } = useGetPlaceSearchResult({
    query,
    category: 'PLACE',
    region: [region.province, region.district].filter(Boolean).join(' '),
    placeTypeList: Object.keys(filterOption.categories).filter(
      (key) => filterOption.categories[key],
    ),
    relatedType,
    boundingBox,
  });

  const lastElementRef = useRef(null);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  useEffect(() => {
    if (placeId == 0) {
      setPlaceData(null);
      return;
    }

    const fetchPlaceData = async () => {
      const result = await getPlaceDetail(placeId);
      setPlaceData(result);
    };

    fetchPlaceData();
  }, [placeId]);

  useEffect(() => {
    if (placeData?.relatedContents) {
      setdisplayRelatedContents(
        isContentExpanded ? placeData.relatedContents : placeData.relatedContents.slice(0, 2),
      );
    }
  }, [placeData, isContentExpanded]);

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (filter) => {
    setFilterOption((prevOption) => {
      const updatedCategories = {
        ...prevOption.categories,
        [filter]: !prevOption.categories[filter],
      };

      // 모든 필터가 false이면 전체 해제 상태로 유지
      const allFalse = Object.values(updatedCategories).every((value) => !value);

      return {
        ...prevOption,
        categories: allFalse ? { ...updatedCategories } : updatedCategories,
      };
    });
  };

  const roundedPlaces = places.map((place) => ({
    ...place,
    lat: parseFloat(place.lat.toFixed(4)),
    lng: parseFloat(place.lng.toFixed(4)),
  }));

  useEffect(() => {
    const newFilteredPlaces = roundedPlaces.filter((place) => {
      if (Object.values(filterOption.categories).every((value) => !value)) {
        return true;
      }
      return filterOption.categories[place.type];
    });

    if (newFilteredPlaces.length === 0) {
      setFilteredPlaces([]);
    } else {
      setFilteredPlaces(newFilteredPlaces);
    }
  }, [places, filterOption]);

  const handleMarkerClick = async (activePlace) => {
    setPlaceId(activePlace);
    setNowActiveMarker(activePlace);
  };

  const handleFocusMarker = (placeId) => {
    setIsExpanded(false);
    setNowActiveMarker(placeId);
  };

  const handleReSearch = (bounds) => {
    const swLat = parseFloat(bounds.getSouthWest().lat().toFixed(1));
    const swLng = parseFloat(bounds.getSouthWest().lng().toFixed(1));
    const neLat = parseFloat(bounds.getNorthEast().lat().toFixed(1));
    const neLng = parseFloat(bounds.getNorthEast().lng().toFixed(1));
    const newBoundingBox = { swLat, swLng, neLat, neLng };
    setBoundingBox(newBoundingBox);
    setQuery('');
    setRegion('');
  };

  // console.log('마커 개수:', places.length);
  // const filteredPlaces = places.slice(0, 6000); // limit
  // console.log('필터 마커 개수:', filteredPlaces.length);

  if (loading) return <Loading />;

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView
          places={filteredPlaces}
          isSearch={true}
          onMarkerClick={handleMarkerClick}
          onReSearch={handleReSearch}
          nowActiveMarker={nowActiveMarker}
          $isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded} $isPlaceInfo={placeId !== 0}>
        <UpButton onClick={toggleBox} $isExpanded={isExpanded}>
          <img src={UpIcon} />
        </UpButton>
        {placeData ? (
          <Content>
            <Title>{placeData.name}</Title>
            {placeData.imageUrl && <Image src={placeData.imageUrl} alt={placeData.name} />}

            {/* 장소 상세 정보 */}
            <PlaceInfo placeData={placeData} />
            {/* 길찾기, 공유 버튼 */}
            <FunctionButton dest={placeData} />
            {/* 장소 관련 작품 정보 */}
            <IconText>
              <IcPencil />
              <p>{mapTranslations.content}</p>
            </IconText>
            <RelatedContent>
              {displayRelatedContents.length > 0 ? (
                displayRelatedContents.map((info) => (
                  <ContentsInfo key={info.contentId} info={info} />
                ))
              ) : (
                <p>{mapTranslations.nocontent}</p>
              )}
            </RelatedContent>
            <ContentButtonWrapper>
              {placeData.relatedContents?.length > 2 && (
                <ShowMoreButton onClick={() => setisContentExpanded(!isContentExpanded)}>
                  {isContentExpanded ? mapTranslations.collapse : mapTranslations.showMore}
                </ShowMoreButton>
              )}
            </ContentButtonWrapper>
          </Content>
        ) : (
          <>
            <FilterContainer>
              <FilterButtons
                filters={filters}
                activeFilter={filterOption.categories}
                onFilterChange={handleFilterChange}
              />
            </FilterContainer>
            {placeList.length > 0 ? (
              <ListContainer>
                {placeList.map((place, index) => (
                  <ListItem
                    key={index}
                    place={place}
                    handleFocus={handleFocusMarker}
                    ref={index === placeList.length - 1 ? lastElementRef : null}
                  />
                ))}
              </ListContainer>
            ) : (
              <NoResultsContainer>
                <NoResultsText>{mapTranslations.noresult}</NoResultsText>
              </NoResultsContainer>
            )}
          </>
        )}
      </ContentSection>

      <CloseButton />
    </Container>
  );
};

const RelatedContent = styled.div`
  margin-bottom: 5rem;
  p {
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const Content = styled.div`
  padding: 0 2rem;
  margin-bottom: 3rem;
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MapSection = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding-bottom: 15rem; */
`;

const UpButton = styled.button`
  border: none;
  margin: 1rem auto;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  img {
    width: 6rem;
    height: 2rem;

    transform: ${({ $isExpanded }) => ($isExpanded ? 'scaleY(-1)' : 'scaleY(1)')};
  }
`;

const FilterContainer = styled.div`
  padding: 0.1rem 2rem;
  position: relative;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentSection = styled.div`
  background-color: #ffffff;
  height: 100%;
  position: absolute;
  bottom: -15rem;
  /* ${(props) =>
    props.$isExpanded
      ? 'bottom: -15rem;'
      : props.$isPlaceInfo
        ? 'top: calc(100vh - 30rem);'
        : 'bottom:-15rem;'} */

  height: ${(props) =>
    props.$isExpanded
      ? props.$isPlaceInfo
        ? '50rem'
        : '50rem'
      : props.$isPlaceInfo
        ? '29rem'
        : '17rem'};

  left: 0;
  right: 0;
  transition: bottom 0.3s ease;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 501;
`;

const ContentButtonWrapper = styled.ul`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
`;

const ShowMoreButton = styled.button`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  margin: 1rem 0;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const Title = styled.div`
  ${({ theme }) => theme.fonts.Title3};
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 20rem;
  border-radius: 8px;
  margin: 1rem 0rem 2rem 0rem;
  object-fit: cover;
  display: block;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  background-color: #f2f2f2;

  & > div:first-child {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 0px 0px 14px 14px;
  }
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 10rem;
`;

const NoResultsText = styled.p`
  ${({ theme }) => theme.fonts.Body3};
  color: #888;
`;

export default MapSearchPlaces;
