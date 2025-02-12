import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcStar } from '../../assets/icons';
import { IcStarBlank } from '../../assets/icons';

const FavoriteItem = ({ item, type }) => {
  const navigate = useNavigate();
  const handleBookmarkClick = (event) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    console.log(`${type === 'works' ? item.title : item.name} 북마크 상태 변경`);
  };
  const handleClick = () => {
    const routeType = type === 'works' ? 'detail' : 'cast'; // '작품' -> detail, '인물' -> drama
    navigate(`/content/${routeType}/${item.targetId}`);
  };

  return (
    <StFavoriteItemWrapper onClick={handleClick}>
      <St.ImageWrapper>
        <St.Image src={item.imageUrl} alt={type === 'works' ? item.title : item.title} />
      </St.ImageWrapper>
      <St.Info>
        <St.Text>{type === 'works' ? item.title : item.title}</St.Text>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {item.bookmarked ? (
          <St.Icon>
            <IcStar />
          </St.Icon>
        ) : (
          <St.Icon>
            <IcStarBlank />
          </St.Icon>
        )}
      </St.BookmarkButton>
    </StFavoriteItemWrapper>
  );
};

export default FavoriteItem;

const StFavoriteItemWrapper = styled.div`
  position: relative;
  height: 16rem;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.White};
  cursor: pointer;
`;

const St = {
  Item: styled.div`
    position: relative;
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.colors.White};
    cursor: pointer;
  `,
  ImageWrapper: styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
  `,
  Info: styled.div`
    position: absolute;
    bottom: 0.8rem;
    left: 0.8rem;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
  `,
  Text: styled.span`
    ${({ theme }) => theme.fonts.Body4};
    font-weight: bold;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Icon: styled.div`
    position: absolute;
    top: 0;
    right: 0;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  `,
};
