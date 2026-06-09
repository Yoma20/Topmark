import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slide.scss";

const Slide = ({ children, slidesToShow, arrowsScroll }) => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: slidesToShow || 1,
    slidesToScroll: arrowsScroll || 1,
    arrows: false,
    // Prevent slick from measuring a 1400px container on first render
    variableWidth: false,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(slidesToShow || 1, 2),
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    // FIX: removed Tailwind classes (bg-gray-100 py-8) — these fight the SCSS
    // rules and may add no styles at all if Tailwind's purge removes them
    <div className="slide">
      <div className="container">
        <Slider {...settings}>
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;