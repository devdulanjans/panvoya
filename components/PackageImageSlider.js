import { useEffect, useState } from 'react';

export default function PackageImageSlider({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [images.length]);

  const activeImage = images[activeIndex] || images[0];

  return (
    <>
      <img src={activeImage} alt={alt} />
      {images.length > 1 && (
        <div className="package-image-dots">
          {images.map((src, index) => (
            <button
              key={index}
              type="button"
              className={index === activeIndex ? 'active' : ''}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
