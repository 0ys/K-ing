import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ImageGrid = ({ images, lastElementRef }) => {
  const navigate = useNavigate();

  const handleImageClick = (postId) => {
    navigate(`/feed/${postId}`);
  };

  return (
    <GridContainer>
      {images.map((image, index) => (
        <GridItem
          key={index}
          ref={index === images.length - 1 ? lastElementRef : null}
          onClick={() => handleImageClick(image.postId)}
        >
          <Image src={image.imageUrl} loading="lazy" alt={`image-${index}`} />
        </GridItem>
      ))}
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3분할 */
  gap: 2px; /* 이미지 간격 */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const GridItem = styled.div`
  position: relative;
  overflow: hidden;
  padding-top: 100%; /* 정방형 비율 유지 */
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지를 정방형에 맞춤 */
`;

export default ImageGrid;
