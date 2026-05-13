import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Carouselimg } from "../../../../assets/HOME-LOGO/img";
import "./CarouselEffect.css";

const CarouselEffect = () => {
  // Check if images exist
  if (!Carouselimg || Carouselimg.length === 0) {
    return (
      <div className="carousel-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">🖥️</div>
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    fade: false,
    cssEase: "ease-in-out",
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  // Custom Previous Arrow
  function CustomPrevArrow(props) {
    const { onClick } = props;
    return (
      <button className="custom-prev-arrow" onClick={onClick} aria-label="Previous slide">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    );
  }

  // Custom Next Arrow
  function CustomNextArrow(props) {
    const { onClick } = props;
    return (
      <button className="custom-next-arrow" onClick={onClick} aria-label="Next slide">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {Carouselimg.map((imageItem, index) => (
          <div key={imageItem.id || index} className="slide-container">
            <img 
              src={imageItem.img1} 
              alt={imageItem.alt || `Slide ${index + 1}`}
              className="carousel-image"
            />
            <div className="slide-overlay"></div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CarouselEffect;