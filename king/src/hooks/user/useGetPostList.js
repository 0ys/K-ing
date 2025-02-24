import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetPostList = (userId) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) {
      return null;
    }

    return pageIndex === 0
      ? `/post/feed?feedType=myPage&userId=${userId}&size=15`
      : `/post/feed?feedType=myPage&userId=${userId}&size=15&cursor=${previousPageData?.data?.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [userId]);

  const posts = data ? [].concat(...data.map((res) => res.data.posts)) : [];
  const isEmpty = data?.[0]?.data?.posts?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.posts?.length < 15);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    postList: posts || [],
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

export default useGetPostList;
