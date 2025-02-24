import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetFeedList = () => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    return pageIndex === 0
      ? `/post/home?size=8`
      : `/post/home?size=8&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [mutate, setSize]);

  const posts = data ? [].concat(...data.map((res) => res.data.posts)) : [];

  const isEmpty = data?.[0]?.data?.posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.posts?.length < 8);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    feedList: posts,
    getNextData: () => {
      if (!isValidating) {
        setSize(size + 1);
      }
    },
    isLoading: isValidating,
    isError: error,
    hasMore,
    mutate,
  };
};

export default useGetFeedList;
