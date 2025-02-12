import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// import { getBookmarkStatus, removeBookmark } from '../../lib/bookmark';
import { getCurations } from '../../lib/bookmark';
import CurationItem from './CurationItem';

const CurationsList = ({ data }) => {
  const [curations, setCurations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurations = async () => {
      setLoading(true);
      const curationsData = await getCurations(); // ✅ bookmark.js에서 불러옴
      setCurations(curationsData);
      setLoading(false);
    };

    fetchCurations();
  }, []);

  return (
    <StCurationList>
      {loading ? (
        <StLoadingMessage>큐레이션 데이터를 불러오는 중...</StLoadingMessage>
      ) : curations.length > 0 ? (
        curations.map((item) => <CurationItem key={item.curationId} item={item} />)
      ) : (
        <StNoDataMessage>등록된 큐레이션이 없습니다.</StNoDataMessage>
      )}
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

  /* 스크롤바를 보이지 않게 설정 */
  &::-webkit-scrollbar {
    display: none; /* 크롬, 사파리 등 Webkit 기반 브라우저 */
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
`;
const StLoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
`;

const StNoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
`;
