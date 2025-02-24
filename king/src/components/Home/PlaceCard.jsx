import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { ScrollPosition } from '../../recoil/atom';

const PlaceCard = forwardRef(({ place }, ref) => {
  const { id, imageUrl, name, details } = place;
  const navigate = useNavigate();

  const setScrollPosition = useSetRecoilState(ScrollPosition);

  const handleClickPlace = () => {
    setScrollPosition(document.querySelector('html').scrollTop);

    navigate(`/place/${id}`);
  };

  return (
    <Card ref={ref} onClick={handleClickPlace}>
      <CardImage src={imageUrl} alt={name} />
      <CardContent>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{details}</CardDescription>
      </CardContent>
    </Card>
  );
});

export default PlaceCard;

const Card = styled.div`
  min-width: 5rem;
  width: 100%;
  height: 10rem;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  cursor: pointer;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 70%;

  object-fit: cover;
  border-radius: 1rem;
`;

const CardContent = styled.div`
  height: 30%;
  width: 100%;
  padding: 0.5rem;

  display: flex;
  flex-direction: column;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const CardTitle = styled.h3`
  margin: 0;
  max-width: 100%;
  text-align: left;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.fonts.Title7};
`;

const CardDescription = styled.p`
  max-width: 100%;
  margin: 0; // Remove margin for better alignment and spacing control
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ theme }) => theme.fonts.Body5};
`;
