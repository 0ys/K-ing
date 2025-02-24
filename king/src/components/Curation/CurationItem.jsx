import { useEffect, useState } from 'react';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { IcBookmarkBlank, IcBookmarkFill } from '../../assets/icons';
import { addBookmark, removeBookmark } from '../../lib/bookmark';

const CurationItem = forwardRef(({ item, onBookmarkChange }, ref) => {
  const location = useLocation();
  const { id: curationId, title, imageUrl, writerNickname, bookmarked: initialBookmarked } = item;
  const [bookmarked, setBookmarked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleBookmarkClick = async (event) => {
    event.stopPropagation();

    // UI 업데이트
    setBookmarked((prev) => !prev);

    let success;

    if (bookmarked) {
      success = await removeBookmark(curationId);
    } else {
      success = await addBookmark(curationId);
    }

    if (!success) {
      // 실패한 경우 상태를 원래대로 복구
      setBookmarked((prev) => !prev);
    }
  };

  const handleCurationClick = () => {
    navigate(`/curation/${curationId}`, { state: { from: location } });
  };

  return (
    <StCurationItemWrapper ref={ref} onClick={handleCurationClick}>
      <St.ImageWrapper>
        <St.Image src={imageUrl} alt={title} />
        <St.GradientOverlay />
      </St.ImageWrapper>
      <St.Info>
        <St.Author>@{writerNickname}</St.Author>
        <St.Title>{title}</St.Title>
      </St.Info>
      <St.BookmarkButton className="drop-shadow" onClick={handleBookmarkClick}>
        {bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />}
      </St.BookmarkButton>
    </StCurationItemWrapper>
  );
});

export default CurationItem;

const StCurationItemWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 24rem;
  overflow: hidden;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.White};

  cursor: pointer;
`;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 24rem;
    overflow: hidden;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.White};

    cursor: pointer;
  `,
  ImageWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  GradientOverlay: styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%; /* 그라데이션 적용 범위 조절 */
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
  `,
  Info: styled.div`
    text-align: left;
    position: absolute;
    bottom: 0.8rem;
    left: 0.8rem;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);

    width: 90%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Author: styled.p`
    max-width: 20rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ${({ theme }) => theme.fonts.Body6};
    margin: 0;
  `,
  Title: styled.h3`
    margin: 0.4rem 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title7};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
    cursor: pointer;

    filter: ${({ theme }) => `drop-shadow(2px 2px 4px ${theme.colors.Yellow}80)`};
  `,
};
