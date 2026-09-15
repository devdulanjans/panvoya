import { useEffect, useState } from 'react';

export default function TravelInspirations({ inspirations = [], heading, subtitle }) {
  const displayHeading = heading || 'Travel Inspirations';
  const [activePage, setActivePage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(inspirations.length / 2));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePage((page) => (page + 1) % pageCount);
    }, 6000);

    return () => clearInterval(interval);
  }, [pageCount]);

  if (inspirations.length === 0) return null;

  return (
    <section className="travel-inspirations" aria-labelledby="inspirations-heading">
      <header className="inspirations-heading">
        <h2 id="inspirations-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="inspirations-viewport">
        <div
          className="inspirations-track"
          style={{
            width: `${pageCount * 100}%`,
            transform: `translateX(-${activePage * (100 / pageCount)}%)`,
            '--page-count': pageCount,
          }}
        >
          {inspirations.map((item) => (
            <article className="inspiration-card" key={item.id}>
              <img src={item.image} alt="" />
              <div className="inspiration-copy">
                <p className="inspiration-location">⌾ {item.location}</p>
                <h3>{item.title}</h3>
                <p className="inspiration-date">▣ &nbsp;{item.date}</p>
                <div className="inspiration-rule" />
                <p className="inspiration-description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="inspiration-arrow previous" aria-label="Previous inspiration" onClick={() => setActivePage((page) => (page - 1 + pageCount) % pageCount)}>‹</button>
        <button type="button" className="inspiration-arrow next" aria-label="Next inspiration" onClick={() => setActivePage((page) => (page + 1) % pageCount)}>›</button>
      </div>
      <a href="#packages" className="inspiration-cta">View All Inspiration ↗</a>
    </section>
  );
}
