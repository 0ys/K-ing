import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '../../components/common/Nav';
import useGetReviewFeed from '../../hooks/review/useGetReviewFeed';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import GoUpButton from '../common/button/GoUpButton';
import Header from '../common/Header';
import SortingRow from '../common/SortingRow';
import Loading from '../Loading/Loading';
import ImageGrid from './ImageGrid';

const ReviewFeed = () => {
  const { placeId } = useParams();
  const [sortBy, setSortBy] = useState('latest');
  const [initialLoading, setInitialLoading] = useState(true);
  const lastElementRef = useRef(null);
  const scrollPosition = useRef(null);

  const { images, getNextData, isLoading, hasMore } = useGetReviewFeed(placeId, sortBy);

  const sortType = {
    가나다순: 'latest',
    인기순: 'popular',
    최신순: 'latest',
  };

  useEffect(() => {
    setInitialLoading(true);
  }, []);

  useEffect(() => {
    if (!isLoading && initialLoading) {
      document.querySelector('html').scrollTo({ top: scrollPosition, behavior: 'smooth' });
      setInitialLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef, sortBy]);

  const handleSorting = (newSorting) => {
    setSortBy(sortType[newSorting]);
  };

  return (
    <>
      <LineContainer ref={scrollPosition}>
        <Header title="Review" isOption={false} />
        <SortingRow onSortingChange={handleSorting} />
      </LineContainer>

      {images.length === 0 && isLoading ? (
        <Loading />
      ) : (
        <ImageGridContainer>
          <ImageGrid images={images} lastElementRef={lastElementRef} />
        </ImageGridContainer>
      )}

      <GoUpButton />
      <Nav />
    </>
  );
};

const LineContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  border-top: 1px solid ${({ theme }) => theme.colors.Gray5};
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray5};
`;

const ImageGridContainer = styled.div`
  padding: 1rem;
`;

export default ReviewFeed;
