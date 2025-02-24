import React from 'react';

import Header from './Header';
import ImageHeader from './ImageHeader';

const DetailHeader = ({ title, imageSrc, imageAltText }) => {
  return (
    <>
      <Header title={title} />
      <ImageHeader src={imageSrc} alt={imageAltText} />
    </>
  );
};

export default DetailHeader;
