import React, { forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IcDelete } from '../../assets/icons';
import { deleteComment } from '../../lib/post';
import { getRelativeCommentDate } from '../../util/getRelativeCommentDate';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';

const Comment = forwardRef(({ data }, ref) => {
  const { postId } = useParams();
  const nowUserId = getUserIdFromToken();

  const {
    commentId,
    content,
    createdAt,
    writer: { userId, nickname, imageUrl },
  } = data;

  const handleDeleteComment = async () => {
    const res = await deleteComment(postId, commentId);
    if (res.success) {
      alert('댓글이 삭제되었습니다');
    }
  };

  return (
    <CommentWrapper ref={ref}>
      <UserInfo>
        <UserProfile>
          <Profile style={{ backgroundImage: `url(${imageUrl})` }} alt="profile" />
          <p>{nickname}</p>
        </UserProfile>
        <DateWrapper>{getRelativeCommentDate(createdAt)}</DateWrapper>
      </UserInfo>

      <Caption>
        <p>{content}</p>
        {String(userId) === nowUserId && <IcDelete onClick={handleDeleteComment} />}
      </Caption>
    </CommentWrapper>
  );
});

export default Comment;

const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  margin-top: 1rem;

  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 1rem;
`;

const UserProfile = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 1rem;

  width: 100%;

  p {
    ${({ theme }) => theme.fonts.Title6};
    color: ${({ theme }) => theme.colors.Gray1};
  }
`;

const Profile = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;

  background-size: cover;
  background-position: center;
`;

const DateWrapper = styled.div`
  width: 100%;

  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray2};
`;

const Caption = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  box-sizing: border-box;
  padding: 0 4rem;

  width: 100%;
  p {
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray1};
  }

  svg {
    cursor: pointer;
  }
`;
