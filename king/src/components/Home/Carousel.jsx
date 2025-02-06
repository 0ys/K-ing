import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import styled from 'styled-components';

const Carousel = ({ carouselList }) => {
  const navigate = useNavigate();

  const handleClickCuration = (curationId) => {
    navigate(`/curation/${curationId}`);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    swipe: true,
  };

  return (
    <Container>
      <StyledSlider {...settings}>
        {carouselList.map((item) => (
          <CarouselItem key={item.id} onClick={() => handleClickCuration(item.id)}>
            <img src={item.imageUrl} alt="carousel-img" />
            <p>{item.title}</p>
          </CarouselItem>
        ))}
      </StyledSlider>
    </Container>
  );
};

export default Carousel;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 18rem;
  overflow: hidden;
  border-radius: 2rem;
`;

const StyledSlider = styled(Slider)`
  width: 100%;
  height: 100%;

  .slick-list {
    overflow: hidden;
    height: 100%;
  }

  .slick-track {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .slick-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
`;

const CarouselItem = styled.div`
  position: relative;
  width: 100%;
  height: 18rem;

  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  p {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: ${({ theme }) => theme.colors.White};
    padding: 0.5rem 1rem;
    ${({ theme }) => theme.fonts.Title6};
    z-index: 2;
  }
`;
