import { motion } from 'framer-motion';
import styled from 'styled-components';

const TypingIndicator = () => {
  return (
    <IndicatorWrapper>
      <Dot
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
      />
      <Dot
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
      />
      <Dot
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
      />
    </IndicatorWrapper>
  );
};

const IndicatorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  margin-bottom: 1rem;
`;

const Dot = styled(motion.span)`
  width: 0.8rem;
  height: 0.8rem;
  background-color: #a991d3;
  border-radius: 50%;
`;

export default TypingIndicator;
