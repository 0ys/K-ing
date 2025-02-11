import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetPostList from '../../hooks/user/useGetPostList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import Loading from '../Loading/Loading';
import PostItem from './PostItem';

const PostsList = ({ userId }) => {
  const lastElementRef = useRef(null);

  const { postList, getNextData, isLoading, hasMore } = useGetPostList(userId);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && postList === 0) return <Loading />;

  if (!postList || postList.length === 0) {
    return <EmptyMessage>등록된 포스트가 없습니다.</EmptyMessage>;
  }

  return (
    <GridContainer>
      {postList.map((post, index) => (
        <PostItem
          key={index}
          item={post}
          ref={index === postList.length - 1 ? lastElementRef : null}
        />
      ))}
    </GridContainer>
  );
};

export default PostsList;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  box-sizing: border-box;
`;

const EmptyMessage = styled.p`
  text-align: center;
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
  box-sizing: border-box;
`;
