import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { IcPencil } from '../../assets/icons';
import UpIcon from '../../assets/icons/up.png';
import { getPlaceDetail } from '../../lib/place';
import { CurationPlaceList } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Bottom from '../common/Bottom';
import CloseButton from '../common/button/CloseButton';
import Loading from '../Loading/Loading';
import ContentsInfo from '../PlaceDetail/ContentsInfo';
import FunctionButton from '../PlaceDetail/FunctionButton';
import PlaceInfo from '../PlaceDetail/PlaceInfo';
import GoogleMapView from './GoogleMapView';

const MapCurationPlaces = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const places = useRecoilValue(CurationPlaceList);

  const [language, setLanguage] = useState(getLanguage());
  const { map: mapTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const [placeId, setPlaceId] = useState(places.length > 0 ? places[0].placeId : null);
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nowActiveMarker, setNowActiveMarker] = useState(0);
  const [isContentExpanded, setisContentExpanded] = useState(false);
  const [displayRelatedContents, setdisplayRelatedContents] = useState([]);

  useEffect(() => {
    if (!placeId) return;

    const fetchPlaceData = async () => {
      try {
        const result = await getPlaceDetail(placeId);
        setPlaceData(result);
      } finally {
        setLoading(false);
      }
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

  const handleMarkerClick = (placeId) => {
    setPlaceId(placeId);
    setNowActiveMarker(placeId);
  };

  if (loading) return <Loading />;

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView
          places={places}
          isSearch={false}
          onMarkerClick={handleMarkerClick}
          $isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          nowActiveMarker={nowActiveMarker}
        />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded} $isPlaceInfo={placeId !== 0}>
        <UpButton onClick={toggleBox} $isExpanded={isExpanded}>
          <img src={UpIcon} />
        </UpButton>

        <Content>
          {loading ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : placeData ? (
            <>
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
            </>
          ) : (
            <ErrorMessage>{mapTranslations.noplace}</ErrorMessage>
          )}
        </Content>
        <Bottom />
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
  padding-bottom: 16rem;
`;

const UpButton = styled.button`
  border: none;
  margin: 1rem auto;
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

const ContentSection = styled.div`
  background-color: #ffffff;
  position: absolute;
  bottom: -5rem;
  height: ${(props) =>
    props.$isExpanded
      ? props.$isPlaceInfo
        ? '50rem'
        : '50rem'
      : props.$isPlaceInfo
        ? '35rem'
        : '23rem'};
  left: 0;
  right: 0;
  transition: bottom 0.3s ease;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 1001;
`;

const Content = styled.div`
  padding: 0 2rem;
  position: relative;
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
  overflow-x: auto; /* 캐러셀 효과 */
  scrollbar-width: none; /* 스크롤바 제거 (Firefox) */
  -ms-overflow-style: none; /* 스크롤바 제거 (IE/Edge) */

  &::-webkit-scrollbar {
    display: none; /* 스크롤바 제거 (Chrome/Safari) */
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

const LoadingMessage = styled.div`
  text-align: center;
  ${({ theme }) => theme.fonts.Body3};
  color: #888;
`;

const ErrorMessage = styled.div`
  text-align: center;
  ${({ theme }) => theme.fonts.Body3};
  color: red;
`;

export default MapCurationPlaces;
