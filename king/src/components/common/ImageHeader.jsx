import React from 'react';
import styled from 'styled-components';

const ImageHeader = ({ src, alt }) => {
  return (
    <>
      <ImageContainer>
        <img src={src} alt={alt} />
      </ImageContainer>
    </>
  );
};

const ImageContainer = styled.div`
  position: relative;
  border-radius: 0px 0px 16px 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 24rem;
    object-fit: cover;
    display: block;
  }
`;

export default ImageHeader;
