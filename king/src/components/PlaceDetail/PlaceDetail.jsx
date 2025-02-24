import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '/src/components/common/Nav';

import { IcPencil } from '../../assets/icons';
import { getPlaceDetail } from '../../lib/place';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Bottom from '../common/Bottom';
import DetailHeader from '../common/DetailHeader';
import Loading from '../Loading/Loading';
import ContentsInfo from './ContentsInfo';
import FunctionButton from './FunctionButton';
import PlaceInfo from './PlaceInfo';

const PlaceDetail = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayRelatedContents, setdisplayRelatedContents] = useState([]);

  const [language, setLanguage] = useState(getLanguage());
  const { place: placeTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const result = await getPlaceDetail(placeId);
        setPlaceData(result);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId]);

  useEffect(() => {
    if (placeData?.relatedContents) {
      setdisplayRelatedContents(
        isExpanded ? placeData.relatedContents : placeData.relatedContents.slice(0, 2),
      );
    }
  }, [placeData, isExpanded]);

  if (loading) return <Loading />;

  const handleRoute = () => {
    navigate(`/reviewfeed/${placeId}`);
  };

  return (
    <Container>
      <DetailHeader
        title={placeData.name}
        imageSrc={placeData.imageUrl}
        imageAltText={placeData.name}
      />

      <Content>
        {/* 장소 상세 정보 */}
        <PlaceInfo placeData={placeData} />

        {/* 길찾기, 공유 버튼 */}
        <FunctionButton dest={placeData} />

        {/* 장소 관련 작품 정보 */}
        <IconText>
          <IcPencil />
          <p>{placeTranslations.content}</p>
        </IconText>
        <RelatedContent>
          {displayRelatedContents.length > 0 ? (
            displayRelatedContents.map((info) => <ContentsInfo key={info.contentId} info={info} />)
          ) : (
            <p>{placeTranslations.nocontent}</p>
          )}
        </RelatedContent>
        <ContentButtonWrapper>
          {placeData.relatedContents?.length > 2 && (
            <ShowMoreButton onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? placeTranslations.collapse : placeTranslations.showMore}
            </ShowMoreButton>
          )}
        </ContentButtonWrapper>

        <BottomContainer>
          <ActionButton onClick={handleRoute}>{placeTranslations.actionButton}</ActionButton>
        </BottomContainer>
        <Bottom />
      </Content>

      <Nav />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const RelatedContent = styled.div`
  margin-bottom: 5rem;
  p {
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const Content = styled.div`
  padding: 2rem;
  position: relative;
`;

const ContentButtonWrapper = styled.ul`
  width: 100%;
  display: flex;
  justify-content: center;
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

const BottomContainer = styled.div`
  padding: 2rem 0rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;

  img {
    width: 1.5rem;
  }
`;

const ActionButton = styled.button`
  ${({ theme }) => theme.fonts.Title3};
  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  color: white;
  padding: 1.4rem 2.2rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-image: linear-gradient(to right, #71c8ff, #0062ff);
  }
`;

export default PlaceDetail;
