import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcLock } from '../../assets/icons';

const PostItem = forwardRef(({ item }, ref) => {
  const { postId, imageUrl, public: isPublic } = item;
  const navigate = useNavigate();

  const handlePostClick = () => {
    navigate(`/feed/${postId}`);
  };

  return (
    <StPostItemWrapper ref={ref} onClick={handlePostClick}>
      <St.Image src={imageUrl} alt={`Post ${postId}`} />
      {!isPublic && (
        <St.LockIcon>
          <IcLock />
        </St.LockIcon>
      )}
    </StPostItemWrapper>
  );
});

export default PostItem;

const StPostItemWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 12rem;
  overflow: hidden;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.White};
  cursor: pointer;
`;

const St = {
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  LockIcon: styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px;
    border-radius: 50%;
  `,
};
