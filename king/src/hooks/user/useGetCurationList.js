import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { mainGetFetcher } from '../../lib/axios';

const useGetCurationList = (userId) => {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.nextCursor) {
      return null; // 마지막 페이지
    }

    return pageIndex === 0
      ? `/curation?userId=${userId}&size=8`
      : `/curation?userId=${userId}&size=8&cursor=${previousPageData.data.nextCursor}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    mainGetFetcher,
  );

  useEffect(() => {
    mutate();
    setSize(1);
  }, [mutate, setSize]);

  const curations = data ? [].concat(...data.map((res) => res.data.curations)) : [];
  const isEmpty = data?.[0]?.data?.curations?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.curations?.length < 8);
  const hasMore = !isEmpty && !isReachingEnd;

  return {
    curationList: curations || [],
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

export default useGetCurationList;
