import { useEffect, useState } from 'react';

export default function FeaturedDestinations({ destinationGroups = {}, heading }) {
  const displayHeading = heading || 'Featured Destinations';
  const categories = Object.keys(destinationGroups);
  const [category, setCategory] = useState(categories[0]);
  const [page, setPage] = useState(0);
  const destinations = destinationGroups[category] || [];
  const pageCount = Math.max(1, Math.ceil(destinations.length / 4));

  useEffect(() => {
    if (!category && categories[0]) setCategory(categories[0]);
  }, [categories, category]);

  useEffect(() => {
    setPage(0);
  }, [category]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPage((current) => (current + 1) % pageCount);
    }, 5500);

    return () => clearInterval(interval);
  }, [pageCount, category]);

  if (categories.length === 0) return null;

  return (
    <section className="destinations-section" aria-labelledby="destinations-heading">
      <h2 id="destinations-heading">{displayHeading}</h2>
      <div className="destination-categories" role="tablist" aria-label="Destination regions">
        {categories.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={item === category}
            className={item === category ? 'active' : ''}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="destination-viewport">
        <div
          className="destination-track"
          style={{
            width: `${pageCount * 100}%`,
            transform: `translateX(-${page * (100 / pageCount)}%)`,
            '--page-count': pageCount,
          }}
        >
          {destinations.map(([name, image]) => (
            <article className="destination-card" key={name}>
              <img src={image} alt={`${name} destination`} />
              <h3><span aria-hidden="true">⌾</span>{name}</h3>
            </article>
          ))}
        </div>
      </div>
      <div className="destination-dots" aria-label="Destination slides">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            type="button"
            aria-label={`Show destination slide ${index + 1}`}
            className={index === page ? 'active' : ''}
            key={index}
            onClick={() => setPage(index)}
          />
        ))}
      </div>
    </section>
  );
}
