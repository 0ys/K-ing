import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '/src/components/common/Nav';

import { getPlaceDetail } from '../../lib/place';
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

  if (loading) return <Loading />;

  const handleRoute = () => {
    navigate(`/reviewfeed/${placeId}`);
  };

  return (
    <Container>
      <DetailHeader
        title={placeData.name}
        isOption={false}
        imageSrc={placeData.imageUrl}
        imageAltText={placeData.name}
      />

      <Content>
        {/* 장소 관련 작품 정보 */}
        {placeData.relatedContents.map((info) => (
          <ContentsInfo key={info.contentId} info={info} />
        ))}

        {/* 길찾기, 공유 버튼 */}
        <FunctionButton dest={placeData} />

        {/* 장소 상세 정보 */}
        <PlaceInfo placeData={placeData} />

        <BottomContainer>
          <ActionButton onClick={handleRoute}>다른 팬의 인증샷이 궁금하다면?</ActionButton>
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

const Content = styled.div`
  padding: 2rem;
  position: relative;
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
