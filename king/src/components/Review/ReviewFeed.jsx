import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '../../components/common/Nav';
import useGetReviewFeed from '../../hooks/review/useGetReviewFeed';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
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

  const { posts, getNextData, isLoading, hasMore } = useGetReviewFeed(placeId, sortBy);

  const [language, setLanguage] = useState(getLanguage());
  const { review: reviewTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const sortType = {
    [reviewTranslations.alphabet]: 'latest',
    [reviewTranslations.popular]: 'popular',
    [reviewTranslations.latest]: 'latest',
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

      {isLoading ? (
        <Loading />
      ) : posts.length === 0 ? (
        <NoImageMessage>
          <p>{reviewTranslations.noPhoto}</p>
          <span>{reviewTranslations.desc}</span>
        </NoImageMessage>
      ) : (
        <ImageGridContainer>
          <ImageGrid images={posts} lastElementRef={lastElementRef} />
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

const NoImageMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  color: ${({ theme }) => theme.colors.Gray0};
  /* font-size: 1.2rem; */

  p {
    font-weight: bold;
    ${({ theme }) => theme.fonts.Title4}
  }

  span {
    margin-top: 0.5rem;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body3}
  }
`;

export default ReviewFeed;
