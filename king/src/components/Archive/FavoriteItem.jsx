import React, { forwardRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcStar, IcStarBlank } from '../../assets/icons';
import { truncateText } from '../../util/truncateText';

const FavoriteItem = forwardRef(({ item, type, onRemove }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [favorited, setFavorited] = useState(true);

  const handleBookmarkClick = async (event) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지

    if (onRemove) {
      await onRemove(item.targetId); // 부모 컴포넌트에서 받은 삭제 함수 실행
    }
  };

  const handleClick = () => {
    const routeType = type === 'works' ? 'detail' : 'cast'; // '작품' -> detail, '인물' -> drama

    navigate(`/content/${routeType}/${item.targetId}`, {
      state: { from: { pathname: location.pathname } },
    });
  };

  return (
    <StFavoriteItemWrapper onClick={handleClick} ref={ref}>
      <St.ImageWrapper>
        <St.Image src={item.imageUrl} alt={type === 'works' ? item.title : item.title} />
        <St.GradientOverlay />
      </St.ImageWrapper>
      <St.Info>
        <St.Text>{truncateText(item.title, 20)}</St.Text>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {favorited ? (
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
});

export default FavoriteItem;

const StFavoriteItemWrapper = styled.div`
  position: relative;
  width: 11rem;
  height: 16rem;
  /* width: auto; */
  /* flex: 0 0 36%; */
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.White};
  cursor: pointer;
  min-width: 0; /* Safari에서 너무 커지는 문제 방지 */
`;

const St = {
  Item: styled.div`
    position: relative;
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.colors.White};
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
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
  GradientOverlay: styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%; /* 그라데이션 적용 범위 조절 */
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
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
