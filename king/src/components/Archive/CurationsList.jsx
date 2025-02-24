import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetCurationList from '../../hooks/archive/useGetCurationList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Loading from '../Loading/Loading';
import CurationItem from './CurationItem';

const CurationsList = () => {
  const language = getLanguage();
  const { archive: translations } = getTranslations(language);
  const lastElementRef = useRef(null);

  const { curationList, getNextData, isLoading, hasMore, mutate } = useGetCurationList();

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && curationList === 0) return <Loading />;

  if (!curationList || curationList.length === 0) {
    return <StNoDataMessage>{translations.noCurations}</StNoDataMessage>;
  }

  return (
    <StCurationList>
      {curationList.map((curation, index) => (
        <CurationItem
          key={index}
          item={curation}
          ref={index === curationList.length - 1 ? lastElementRef : null}
          onRemove={() => mutate()} // 북마크 해제 후 mutate() 실행 → 리스트 자동 갱신
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
  margin-bottom: 8rem;
  overflow-y: auto;

  /* 스크롤바를 보이지 않게 설정 */
  &::-webkit-scrollbar {
    display: none; /* 크롬, 사파리 등 Webkit 기반 브라우저 */
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
`;

const StNoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
`;
