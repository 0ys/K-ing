import React from 'react';
import styled, { keyframes } from 'styled-components';

const SkeletonCuration = () => {
  return (
    <SkeletonWrapper>
      <SkeletonImage />
      <SkeletonText />
    </SkeletonWrapper>
  );
};

export default SkeletonCuration;

// 🔹 로딩 애니메이션 효과 추가
const shimmer = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const SkeletonWrapper = styled.div`
  width: 100%;
  height: 24rem;
  background: ${({ theme }) => theme.colors.Gray4};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const SkeletonImage = styled.div`
  width: 80%;
  height: 16rem;
  background: ${({ theme }) => theme.colors.Gray3};
  border-radius: 8px;
  margin-bottom: 1rem;
  animation: ${shimmer} 1.2s infinite linear;
`;

const SkeletonText = styled.div`
  width: 60%;
  height: 1rem;
  background: ${({ theme }) => theme.colors.Gray2};
  border-radius: 4px;
  animation: ${shimmer} 1.2s infinite linear;
`;
