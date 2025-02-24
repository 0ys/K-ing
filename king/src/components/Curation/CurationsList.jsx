import React, { useEffect } from 'react';
import { useRef } from 'react';
import styled from 'styled-components';

import useGetCurationList from '../../hooks/search/useGetCurationList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import Loading from '../Loading/Loading';
import CurationItem from './CurationItem';

const CurationsList = ({ query }) => {
  const { curationList, getNextData, isLoading, hasMore } = useGetCurationList(query);

  const lastElementRef = useRef(null);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && curationList.length === 0) return <Loading />;

  return (
    <StCurationList>
      {curationList &&
        curationList.map((item, index) => (
          <CurationItem
            key={item.id}
            item={item}
            ref={index === curationList?.length - 1 ? lastElementRef : null}
          />
        ))}
    </StCurationList>
  );
};

export default CurationsList;

const StCurationList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.1rem;
  width: 100%;
  overflow-y: auto;
`;
