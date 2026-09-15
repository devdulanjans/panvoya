import { useEffect, useState } from 'react';

export default function HeroSlider({ slides = [], fallbackTitle = '', fallbackDescription = '' }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <section className="hero-slider">
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const hasVideo = Boolean(slide.video);
        return (
          <div
            key={slide.id ?? index}
            className={`slide ${isActive ? 'active' : ''}`}
            style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
          >
            {hasVideo && isActive && (
              <video
                className="slide-video"
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            )}
            <div className={`slide-overlay ${index % 2 === 0 ? 'slide-overlay-right' : 'slide-overlay-left'}`}>
              <h1>{slide.title || fallbackTitle}</h1>
              {(slide.description || fallbackDescription) && <p>{slide.description || fallbackDescription}</p>}
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <div className="hero-slider-dots" aria-label="Hero slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id ?? index}
              type="button"
              className={index === currentSlide ? 'active' : ''}
              aria-label={`Show slide ${index + 1} of ${slides.length}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
