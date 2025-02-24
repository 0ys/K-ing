import React from 'react';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import defaultImg from '/src/assets/icons/king_logo.png';

import { ContentType, SearchQueryState } from '../../recoil/atom';
import { PlaceSearchQueryState } from '../../recoil/atom';

const SearchItem = forwardRef(({ item }, ref) => {
  const { id, category, name, imageUrl } = item;
  const setContentType = useSetRecoilState(ContentType);

  const setPlaceSearchState = useSetRecoilState(PlaceSearchQueryState);
  const searchQuery = useRecoilValue(SearchQueryState);

  const navigate = useNavigate();

  const handleClick = () => {
    setContentType('search');

    if (category === 'PLACE') {
      navigate(`/place/${id}`);
    } else if (category === 'CAST') {
      setPlaceSearchState(searchQuery);
      navigate(`/content/cast/${id}`);
    } else {
      setPlaceSearchState(searchQuery);
      navigate(`/content/detail/${id}`);
    }
  };

  return (
    <St.Item onClick={handleClick} ref={ref}>
      <ImageWrapper>
        <Image
          src={imageUrl || defaultImg}
          alt={name}
          $defaultImage={imageUrl?.includes('default.jpg')}
        />
      </ImageWrapper>
      <Text>{name}</Text>
    </St.Item>
  );
});

export default SearchItem;

const St = {
  Item: styled.div`
    cursor: pointer;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    gap: 0.5rem;

    min-width: 8.5rem;
    max-width: 8.5rem;
    width: 100%;

    max-height: 15rem;

    background-color: ${({ theme }) => theme.colors.White};
  `,
};

const ImageWrapper = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  flex: 8;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  object-fit: ${({ $defaultImage }) => ($defaultImage ? 'contain' : 'cover')};

  overflow: hidden;
`;

const Text = styled.span`
  flex: 1.5;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2em;
  max-height: 2.4em;
  white-space: normal;

  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
