import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import UpIcon from '../../assets/icons/up.png';
import { searchMapView } from '../../lib/map';
import { getPlaceDetail } from '../../lib/place';
import { FilterOption, SearchQueryState, SearchRegionState } from '../../recoil/atom';
import CloseButton from '../common/button/CloseButton';
import Loading from '../Loading/Loading';
import ContentsInfo from '../PlaceDetail/ContentsInfo';
import FunctionButton from '../PlaceDetail/FunctionButton';
import PlaceInfo from '../PlaceDetail/PlaceInfo';
import FilterButtons from './FilterButtons';
import GoogleMapView from './GoogleMapView';
import ListItem from './ListItem';

const MapSearchPlaces = () => {
  const query = useRecoilValue(SearchQueryState);
  const region = useRecoilValue(SearchRegionState);
  const [filterOption, setFilterOption] = useRecoilState(FilterOption);

  const [isExpanded, setIsExpanded] = useState(false);
  const [nowActiveMarker, setNowActiveMarker] = useState(0);
  const [places, setPlaces] = useState([]);
  const [placeId, setPlaceId] = useState(0);
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const filters = ['RESTAURANT', 'CAFE', 'PLAYGROUND', 'STORE', 'STAY'];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await searchMapView(query, region);
        setPlaces(data);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [query, region]);

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

  const filteredPlaces = roundedPlaces.filter((place) => {
    if (Object.values(filterOption.categories).every((value) => !value)) return true;
    return filterOption.categories[place.type];
  });

  const handleMarkerClick = async (activePlace) => {
    setPlaceId(activePlace);
  };

  const handleFocusMarker = (placeId) => {
    setIsExpanded(false);
    setNowActiveMarker(placeId);
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
          nowActiveMarker={nowActiveMarker}
          $isExpanded={isExpanded}
        />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded} $isPlaceInfo={placeId !== 0}>
        <UpButton onClick={toggleBox} $isExpanded={isExpanded}>
          <img src={UpIcon} />
        </UpButton>
        {placeData ? (
          <div style={{ padding: '0 2rem' }}>
            <Title>{placeData.name}</Title>
            {placeData.imageUrl && <Image src={placeData.imageUrl} alt={placeData.name} />}

            {placeData.relatedContents?.map((info) => (
              <ContentsInfo key={info.contentId} info={info} />
            ))}

            <FunctionButton dest={placeData} />

            <PlaceInfo placeData={placeData} />
          </div>
        ) : (
          <>
            <FilterContainer>
              <FilterButtons
                filters={filters}
                activeFilter={filterOption.categories}
                onFilterChange={handleFilterChange}
              />
            </FilterContainer>
            {filteredPlaces.length > 0 ? (
              <ListContainer>
                {filteredPlaces.map((place) => (
                  <ListItem key={place.placeId} place={place} handleFocus={handleFocusMarker} />
                ))}
              </ListContainer>
            ) : (
              <NoResultsContainer>
                <NoResultsText>검색 결과가 없습니다.</NoResultsText>
              </NoResultsContainer>
            )}
          </>
        )}
      </ContentSection>

      <CloseButton />
    </Container>
  );
};

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
        ? 'fit-content'
        : '60rem'
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
  height: 20rem;
`;

const NoResultsText = styled.p`
  ${({ theme }) => theme.fonts.Body3};
  color: #888;
`;

export default MapSearchPlaces;
