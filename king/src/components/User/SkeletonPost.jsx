import React from 'react';
import styled from 'styled-components';

const SkeletonPost = () => {
  return (
    <SkeletonWrapper>
      <SkeletonImage />
    </SkeletonWrapper>
  );
};

export default SkeletonPost;

const SkeletonWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 12rem;
  background: ${({ theme }) => theme.colors.Gray4};
  border-radius: 8px;
  overflow: hidden;
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.Gray3};
  border-radius: 8px;
  animation: shimmer 1.2s infinite linear;

  @keyframes shimmer {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;
