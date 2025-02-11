import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcComments, IcHeartTrue, IcLikes } from '../../assets/icons';
import { formatDate } from '../../util/formatDate';

const PostItem = forwardRef(({ post, column }, ref) => {
  const navigate = useNavigate();

  const handleFeedClick = (id) => {
    navigate(`/feed/${id}`);
  };

  return (
    <St.Item ref={ref} onClick={() => handleFeedClick(post.postId)}>
      <ImageWrapper $column={column}>
        <St.Image src={post.imageUrl} alt={post.writer.nickname} />
      </ImageWrapper>
      <St.Info>
        <St.Action>
          <IconText>
            {post.liked ? <IcHeartTrue /> : <IcLikes />}
            <p>{post.likesCnt}</p>
          </IconText>
          <IconText>
            <IcComments />
            <p>{post.commentsCnt}</p>
          </IconText>
        </St.Action>
        <St.Title>{post.content}</St.Title>
        <St.Author>@{post.writer.nickname}</St.Author>
        <St.Date>{formatDate(post.createdAt)}</St.Date>
      </St.Info>
    </St.Item>
  );
});

export default PostItem;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    object-fit: cover;
  `,
  Info: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;

    padding: 0.5rem;
    color: ${({ theme }) => theme.colors.Gray0};
  `,
  Action: styled.div`
    display: flex;
    width: 100%;
    gap: 1rem;
    color: ${({ theme }) => theme.colors.Gray1};
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Title7};
    color: #464656;
  `,
  Title: styled.h3`
    margin: 0.2rem 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Body5};

    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2em;
    max-height: 2.4em;
    white-space: normal;
  `,
  Date: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    color: #464656;
  `,
};

const ImageWrapper = styled.div`
  width: 100%;
  height: ${(props) => (props.$column === 1 ? '25rem' : '15rem')};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.3rem;

  img {
    width: 20px;
    height: 20px;
  }

  p {
    ${({ theme }) => theme.fonts.Title6};
  }
`;
