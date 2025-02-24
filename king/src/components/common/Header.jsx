import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';

import BackButton from './button/BackButton';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasAnimated, setHasAnimated] = useState(false); // 애니메이션 종료 여부
  const [offsetX, setOffsetX] = useState(0); // 현재 드래그 위치
  const [isDragging, setIsDragging] = useState(false); // 드래그 여부
  const startX = useRef(0); // 드래그 시작 위치
  const prevOffsetX = useRef(0); // 이전 오프셋 저장

  const containerRef = useRef(null); // TitleContainer 참조
  const titleRef = useRef(null); // SlidingTitle 참조

  // 애니메이션 종료 시 처리
  const handleAnimationEnd = () => {
    setHasAnimated(true);
  };

  // 드래그 시작
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX; // 터치 시작 위치 저장
  };

  // 드래그 중
  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX.current; // 드래그 거리 계산
    const newOffsetX = prevOffsetX.current + deltaX;

    // 컨테이너 크기와 제목 크기를 기준으로 offset 제한
    const containerWidth = containerRef.current.offsetWidth;
    const titleWidth = titleRef.current.offsetWidth;

    const maxOffset = 0; // 제목이 컨테이너 왼쪽을 넘지 않음
    const minOffset = containerWidth - titleWidth; // 제목이 컨테이너 오른쪽 끝에 맞춤

    setOffsetX(Math.max(Math.min(newOffsetX, maxOffset), minOffset));
  };

  // 드래그 종료
  const handleTouchEnd = () => {
    setIsDragging(false);
    prevOffsetX.current = offsetX; // 드래그 종료 시 위치 저장
  };

  const handleGoBack = () => {
    //이전 경로 구하기
    const from = location.state?.from?.pathname || '';

    if ((from && from.includes('upload')) || from.includes('update')) {
      navigate('/home');
    } else if (from || !window.location.pathname.includes('/curation')) {
      navigate(-1);
    } else if (from && from.includes('/chatbot')) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <Container>
      <StHeader>
        <BackButton onBack={handleGoBack} />
        <TitleContainer
          ref={containerRef}
          onTouchStart={hasAnimated ? handleTouchStart : null}
          onTouchMove={hasAnimated ? handleTouchMove : null}
          onTouchEnd={hasAnimated ? handleTouchEnd : null}
        >
          <SlidingTitle
            ref={titleRef}
            $isLong={!hasAnimated && title.length > 22} // 긴 제목 조건
            $hasAnimated={hasAnimated}
            style={{
              transform: `translateX(${offsetX}px)`,
            }}
            onAnimationEnd={handleAnimationEnd} // 애니메이션 종료 이벤트
          >
            <span>{title}</span>
          </SlidingTitle>
        </TitleContainer>
      </StHeader>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const StHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0.7rem;
  gap: 1rem;
`;

const TitleContainer = styled.div`
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  margin-right: 3rem;
`;

// 슬라이딩 애니메이션
const slide = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

const SlidingTitle = styled.div`
  ${({ theme }) => theme.fonts.Title1};
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
  cursor: ${({ hasAnimated }) => (hasAnimated ? 'grab' : 'default')};
  animation: ${({ $isLong, hasAnimated }) =>
    $isLong && !hasAnimated
      ? css`
          ${slide} 10s linear 1 forwards
        `
      : 'none'};
`;

export default Header;
