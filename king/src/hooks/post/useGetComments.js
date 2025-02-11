import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetComments = (postId) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    return pageIndex === 0
      ? `/post/${postId}/comment?size=5`
      : `/post/${postId}/comment?size=5&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [postId, mutate, setSize]);

  const results = data ? [].concat(...data.map((res) => res.data)) : [];
  const commentList = data ? [].concat(...data.map((res) => res.data.comments)) : [];
  const isEmpty = data?.[0]?.data?.comments?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.comments?.length < 5);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    reactionList: results[0],
    commentList,
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

export default useGetComments;
