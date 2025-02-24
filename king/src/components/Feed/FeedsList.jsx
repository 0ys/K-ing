import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetFeedList from '../../hooks/feed/useGetFeedList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import Loading from '../Loading/Loading';
import PostItem from './PostItem';

const FeedsList = ({ columns }) => {
  const lastElementRef = useRef(null);

  const { feedList, getNextData, isLoading, hasMore } = useGetFeedList();

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && feedList.length === 0) return <Loading />;

  return (
    <StList $columns={columns}>
      {feedList.map((post, index) => (
        <PostItem
          key={post.postId}
          post={post}
          column={columns}
          ref={index === feedList.length - 1 ? lastElementRef : null}
        />
      ))}
    </StList>
  );
};

export default FeedsList;

const StList = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns}, 1fr);
  gap: 0.7rem;
  overflow-y: auto;

  padding: 0.5rem 2rem;
  margin-bottom: 6rem;

  width: 100%;
`;
