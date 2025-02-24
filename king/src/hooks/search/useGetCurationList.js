import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetCurationList = (query) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    return pageIndex === 0
      ? `/curation-lists/search?query=${encodeURIComponent(query)}`
      : `/curation-lists/search?query=${encodeURIComponent(query)}&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [query, mutate]);

  const results = data ? [].concat(...data.map((res) => res.data.items)) : [];
  const isEmpty = data?.[0]?.data?.items?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.items?.length < 10);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    curationList: results,
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

export default useGetCurationList;
