import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import LocationIcon from '../../assets/icons/location.png';
import { getShortAddress } from '../../util/addressFormat';

const CardListItem = ({ place }) => {
  const navigate = useNavigate();

  const handleCurationClick = (id) => {
    navigate(`/place/${id}`);
  };
  const { placeId, imageUrl, name, address } = place;

  return (
    <CardContainer onClick={() => handleCurationClick(placeId)}>
      {/* 이미지 컨테이너 */}
      <ImageContainer>
        <Image src={imageUrl} alt={name} />
      </ImageContainer>

      {/* 텍스트 컨테이너 */}
      <TextContainer>
        <Title>{name}</Title>
        <Address>
          <img src={LocationIcon} alt="location" />
          {getShortAddress(address)}
        </Address>
      </TextContainer>
    </CardContainer>
  );
};

export default CardListItem;

const CardContainer = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;

  width: 100%;
  overflow: hidden;

  cursor: pointer;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 22rem;
  overflow: hidden;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  text-align: left;

  width: 100%;
`;

const Title = styled.h3`
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Address = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.4rem;
  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray1};

  img {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 0.4rem;
  }
`;
