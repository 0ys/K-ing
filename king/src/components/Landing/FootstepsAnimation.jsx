import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { IcFootL, IcFootR } from '../../assets/icons';

// 색상 배열
const footprintColors = [
  '#E8E8F4',
  '#E8E8F4',
  '#CFCED3',
  '#CFCED3',
  '#CFCED3',
  '#3D3D3D',
  '#3D3D3D',
];

// 개별 발자국 컴포넌트
const Footprint = ({ delay, x, y, rotate, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, x: x - 10, y: y - 10, rotate: rotate - 10 }}
    animate={{ opacity: 1, scale: 1, x, y, rotate }}
    transition={{
      duration: 0.3,
      delay,
      ease: 'easeOut',
    }}
  >
    {index % 2 === 0 ? (
      <StyledFootprintLeft index={index} />
    ) : (
      <StyledFootprintRight index={index} />
    )}
  </motion.div>
);

const FootstepsAnimation = ({ logoRef }) => {
  const [position, setPosition] = useState({ top: '70%' });
  const [top, setTop] = useState('70%');

  useEffect(() => {
    const updatePosition = () => {
      if (!logoRef?.current) return;

      const logoRect = logoRef.current.getBoundingClientRect();
      setPosition({ top: `${logoRect.bottom + 20}px` }); // 로고 하단 기준으로 조정
    };

    // 처음 한 번 실행 후, 리사이즈 감지
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [logoRef]);

  const footprints = [
    { x: -100, y: 100, rotate: 60, delay: 0 },
    { x: -40, y: 90, rotate: 50, delay: 0.2 },
    { x: -35, y: -10, rotate: 60, delay: 0.4 },
    { x: 25, y: -20, rotate: 50, delay: 0.6 },
    { x: 30, y: -110, rotate: 60, delay: 0.8 },
    { x: 90, y: -120, rotate: 50, delay: 1.0 },
    { x: 95, y: -210, rotate: 60, delay: 1.2 },
  ];

  return (
    <FootstepsWrapper>
      {footprints.map((step, index) => (
        <Footprint
          key={index}
          index={index}
          x={step.x}
          y={step.y}
          rotate={step.rotate}
          delay={step.delay}
        />
      ))}
    </FootstepsWrapper>
  );
};

export default FootstepsAnimation;

// 스타일 정의
const FootstepsWrapper = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 20rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;

// Styled SVG Components
const StyledFootprintLeft = styled(IcFootL)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 3rem;
  height: auto;
`;

const StyledFootprintRight = styled(IcFootR)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 3rem;
  height: auto;
`;
