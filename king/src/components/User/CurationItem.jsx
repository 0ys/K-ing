import { forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcLock } from '../../assets/icons';

const CurationItem = forwardRef(({ item }, ref) => {
  const { curationId, title, imageUrl, public: isPublic } = item;
  const navigate = useNavigate();
  const location = useLocation();

  const handleCurationClick = () => {
    navigate(`/curation/${curationId}`, { state: { from: location } });
  };

  return (
    <StCurationItemWrapper ref={ref} onClick={handleCurationClick}>
      <St.ImageWrapper>
        <St.Image src={imageUrl} alt={title} />
        <St.GradientOverlay />
      </St.ImageWrapper>
      <St.Info>
        <St.Title>{title}</St.Title>
      </St.Info>
      {!isPublic && (
        <St.LockIcon>
          <IcLock />
        </St.LockIcon>
      )}
    </StCurationItemWrapper>
  );
});

export default CurationItem;

const StCurationItemWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 24rem;
  overflow: hidden;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.White};

  cursor: pointer;
`;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 24rem;
    overflow: hidden;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.White};
  `,
  ImageWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  GradientOverlay: styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%; /* 그라데이션 적용 범위 조절 */
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
  `,
  Info: styled.div`
    text-align: left;
    position: absolute;
    bottom: 0.8rem;
    left: 0.8rem;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);

    width: 90%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    margin: 0;
  `,
  Title: styled.h3`
    margin: 0.4rem 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title7};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  `,

  LockIcon: styled.div`
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px;
    border-radius: 50%;
  `,
};
