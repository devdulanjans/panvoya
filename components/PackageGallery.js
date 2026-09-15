import { useEffect, useState } from 'react';
import styles from './PackageGallery.module.css';

export default function PackageGallery({ images = [], title = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isLightboxOpen = lightboxIndex !== null;

  useEffect(() => {
    if (images.length <= 1 || isLightboxOpen) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length, isLightboxOpen]);

  useEffect(() => {
    if (lightboxIndex !== null) setActiveIndex(lightboxIndex);
  }, [lightboxIndex]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex((index) => (index + 1) % images.length);
      if (event.key === 'ArrowLeft') setLightboxIndex((index) => (index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (images.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainImageWrap} onClick={() => setLightboxIndex(activeIndex)}>
        <img src={images[activeIndex]} alt={`${title} photo ${activeIndex + 1}`} className={styles.mainImage} />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbRow}>
          {images.map((url, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.thumbButton} ${index === activeIndex ? styles.thumbButtonActive : ''}`}
              onClick={() => {
                setActiveIndex(index);
                setLightboxIndex(index);
              }}
              aria-label={`View photo ${index + 1}`}
            >
              <img src={url} alt="" className={styles.thumbImage} />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button type="button" className={styles.lightboxClose} onClick={() => setLightboxIndex(null)} aria-label="Close">
            ✕
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex((index) => (index - 1 + images.length) % images.length);
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            src={images[lightboxIndex]}
            alt={`${title} photo ${lightboxIndex + 1}`}
            className={styles.lightboxImage}
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex((index) => (index + 1) % images.length);
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          <span className={styles.lightboxCounter}>{lightboxIndex + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
}
