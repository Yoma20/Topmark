import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slide = ({ children, slidesToShow, arrowsScroll }) => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: slidesToShow || 1,
    slidesToScroll: arrowsScroll || 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(slidesToShow || 1, 2),
          slidesToScroll: arrowsScroll || 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="slide bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Slider {...settings}>
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;