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
    mutate();
    setSize(1);
  }, [mutate, setSize]);

  const images = data
    ? data.flatMap((res) =>
        res.data.posts.map((post) => ({
          postId: post.postId,
          imageUrl: post.imageUrl,
        })),
      )
    : [];

  const isEmpty = data?.[0]?.data?.posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.posts?.length < 15);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    images,
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
