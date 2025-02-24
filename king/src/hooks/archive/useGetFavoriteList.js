import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';
import { convertType } from '../../util/convertType';

const useGetFavoriteList = (type) => {
  const apiType = convertType(type);

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) {
      return null; // 마지막 페이지
    }

    return pageIndex === 0
      ? `/favorite?type=${apiType}&size=12`
      : `/favorite?type=${apiType}&size=12&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [apiType, mutate, setSize]);

  const favorites = data ? [].concat(...data.map((res) => res.data.favorites)) : [];
  const isEmpty = data?.[0]?.data?.favorites?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.favorites?.length < 12);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    favoritesList: favorites || [],
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

export default useGetFavoriteList;
