import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetPostList from '../../hooks/user/useGetPostList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Loading from '../Loading/Loading';
import PostItem from './PostItem';
import SkeletonPost from './SkeletonPost';

const PostsList = ({ userId }) => {
  const language = getLanguage();
  const { user: translations } = getTranslations(language);

  const lastElementRef = useRef(null);

  const { postList, getNextData, isLoading, hasMore } = useGetPostList(userId);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && postList === 0) return <Loading />;

  if (!postList || postList.length === 0) {
    return <EmptyMessage>{translations.noPosts}</EmptyMessage>;
  }

  return (
    <>
      <GridContainer>
        {postList.map((post, index) => (
          <PostItem
            key={index}
            item={post}
            ref={index === postList.length - 1 ? lastElementRef : null}
          />
        ))}
      </GridContainer>
      {isLoading && (
        <SkeletonContainer>
          {Array(3) // 3개씩 로딩
            .fill(0)
            .map((_, index) => (
              <SkeletonPost key={index} />
            ))}
        </SkeletonContainer>
      )}
    </>
  );
};

export default PostsList;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
  box-sizing: border-box;
`;
const SkeletonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
`;
