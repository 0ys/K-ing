import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetReviewFeed = (placeId, sortedBy = 'popular') => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    return pageIndex === 0
      ? `/post/feed?feedType=review&placeId=${placeId}&sortedBy=${sortedBy}&size=15`
      : `/post/feed?feedType=review&placeId=${placeId}&sortedBy=${sortedBy}&size=15&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    setSize(1);
  }, [mutate, setSize]);

  const posts = data ? data.flatMap((res) => res.data.posts) : [];

  const isEmpty = posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.posts?.length < 10);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    posts,
    getNextData: () => {
      if (!isValidating) {
        setSize(size + 1);
      }
    },
    isLoading: isValidating,
    isError: error,
    hasMore,
  };
};

export default useGetReviewFeed;
