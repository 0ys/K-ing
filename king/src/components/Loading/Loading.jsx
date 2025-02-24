import { motion } from 'framer-motion';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a5568;
`;

const DotContainer = styled.div`
  display: flex;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const Dot = styled(motion.span)`
  width: 0.75rem;
  height: 0.75rem;
  background: #3b82f6;
  border-radius: 50%;
`;

const Loading = () => {
  return (
    <LoadingContainer>
      <LoadingText>Loading</LoadingText>
      <DotContainer>
        {[0, 1, 2].map((i) => (
          <Dot
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.2,
            }}
          />
        ))}
      </DotContainer>
    </LoadingContainer>
  );
};

export default Loading;
