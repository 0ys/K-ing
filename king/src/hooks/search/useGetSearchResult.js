import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetSearchResult = (query, category, sortOption) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) return null; // 마지막 페이지

    return pageIndex === 0
      ? `/search/search?query=${encodeURIComponent(query)}&category=${category}&size=15&sortBy=${sortOption}&sortOrder=desc`
      : `/search/search?query=${encodeURIComponent(query)}&category=${category}&size=15&cursor=${previousPageData.data.nextCursor}&sortBy=${sortOption}&sortOrder=desc`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [query, category, mutate, setSize]);

  const results = data ? [].concat(...data.map((res) => res.data.results)) : [];
  const isEmpty = data?.[0]?.data?.results.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.results?.length < 15);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    searchResultList: results,
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

export default useGetSearchResult;
