import { useEffect, useState } from 'react';

export default function DiscountCarousel({ offers = [], heading, subtitle }) {
  const displayHeading = heading || 'Discounts & Offers';
  const [activeOffer, setActiveOffer] = useState(0);
  const pageCount = Math.max(1, Math.ceil(offers.length / 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOffer((current) => (current + 1) % pageCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [pageCount]);

  if (offers.length === 0) return null;

  return (
    <section className="discount-section" aria-labelledby="discount-heading">
      <div className="discount-heading">
        <h2 id="discount-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="offers-viewport">
        <div
          className="offers-track"
          style={{
            width: `${pageCount * 100}%`,
            transform: `translateX(-${activeOffer * (100 / pageCount)}%)`,
            '--page-count': pageCount,
          }}
        >
          {offers.map((offer) => (
            <article className={`offer-card offer-${offer.layoutVariant}`} key={offer.id}>
              <img src={offer.image} alt="" />
              <div className="offer-shade" />
              <div className="offer-copy">
                <span>{offer.accent}</span>
                <strong>{offer.discount}</strong>
                <b>{offer.title}</b>
                <em>{offer.action}</em>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="offer-dots" aria-label="Discount offer slides">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            type="button"
            key={index}
            aria-label={`Show offer ${index + 1}`}
            className={index === activeOffer ? 'active' : ''}
            onClick={() => setActiveOffer(index)}
          />
        ))}
      </div>
    </section>
  );
}
