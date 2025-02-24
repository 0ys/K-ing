import { useState } from 'react';
import { forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { mutate } from 'swr/_internal';

import { IcBookmarkBlank, IcBookmarkFill, IcLock } from '../../assets/icons';
import { removeBookmark } from '../../lib/bookmark';

const CurationItem = forwardRef(({ item, onRemove }, ref) => {
  const location = useLocation();
  const {
    curationId,
    title,
    imageUrl,
    writerNickname,
    bookmarked: initialBookmarked,
    public: isPublic,
  } = item;
  const [bookmarked, setBookmarked] = useState(initialBookmarked); // 초기 상태를 item.bookmarked로 설정
  const navigate = useNavigate();

  const handleBookmarkClick = async (event) => {
    event.stopPropagation(); // 이벤트 버블링 방지

    const success = await removeBookmark(curationId);
    if (success) {
      onRemove(curationId);
    } else {
      setBookmarked(true); // 실패 시 다시 북마크 상태 복구
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
      {!isPublic && (
        <St.LockIcon>
          <IcLock />
        </St.LockIcon>
      )}
      <St.BookmarkButton className="drop-shadow" onClick={handleBookmarkClick}>
        {bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />} {/* 상태에 따라 아이콘 변경 */}
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

  /* transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
  &:hover {
    opacity: 0.9;
  } */
`;

const St = {
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
    ${({ theme }) => theme.fonts.Body6};
    margin: 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

    cursor: pointer;

    // 북마크 뒤에 그림자
    filter: ${({ theme }) => `drop-shadow(2px 2px 4px ${theme.colors.Yellow}80)`};
  `,
  LockIcon: styled.div`
    position: absolute;
    top: 0.8rem;
    right: 3rem;
    /* background-color: rgba(0, 0, 0, 0.5); */
    padding: 5px;
    border-radius: 50%;
  `,
};
