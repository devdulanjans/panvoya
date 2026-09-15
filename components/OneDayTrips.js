import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PackagePriceList from './PackagePriceList';
import { useContact } from './ContactContext';

function trackClick(id) {
  try {
    fetch('/api/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
  } catch {
    // best-effort tracking, ignore failures
  }
}

function reservationLink(title, whatsappNumber) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to make a reservation for ${title}`)}`;
}

export default function OneDayTrips({ trips = [], heading, subtitle }) {
  const router = useRouter();
  const { whatsapp } = useContact();
  const displayHeading = heading || 'One Day Trips';
  const [activePage, setActivePage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(trips.length / 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePage((page) => (page + 1) % pageCount);
    }, 5500);

    return () => clearInterval(interval);
  }, [pageCount]);

  if (trips.length === 0) return null;

  const openTrip = (trip) => {
    trackClick(trip.id);
    router.push(`/packages/${trip.slug}`);
  };

  return (
    <section className="popular-packages one-day-trips" aria-labelledby="one-day-trips-heading">
      <header className="popular-packages-heading">
        <h2 id="one-day-trips-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="one-day-viewport">
        <div
          className="one-day-track"
          style={{
            width: `${pageCount * 100}%`,
            transform: `translateX(-${activePage * (100 / pageCount)}%)`,
            '--page-count': pageCount,
          }}
        >
          {trips.map((trip) => (
            <article
              className="package-card one-day-card"
              key={trip.id}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => openTrip(trip)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openTrip(trip);
              }}
            >
              <div className="package-image">
                <img src={trip.image} alt={`${trip.title} destination`} />
                <span className="package-badge">{trip.category}</span>
                <div className="package-image-dots" aria-hidden="true"><i /><i /><i /></div>
              </div>
              <div className="package-card-body">
                <h3>{trip.title}</h3>
                <p className="package-meta"><span>⌾ {trip.duration}</span></p>
                <div className="package-action">
                  <div className="package-action-buttons">
                    <a
                      href={`/packages/${trip.slug}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        trackClick(trip.id);
                      }}
                    >
                      More Details ↗
                    </a>
                    <a
                      href={reservationLink(trip.title, whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="package-reserve-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackClick(trip.id);
                      }}
                    >
                      Reservation
                    </a>
                  </div>
                  <PackagePriceList currencies={trip.currencies} prices={trip.prices} />
                </div>
                <div className="package-features"><span>◈ Experience ⓘ</span><span>◉ Inclusion ⓘ</span></div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="package-dots" aria-label="One day trip slides">
        {Array.from({ length: pageCount }, (_, index) => (
          <button type="button" className={index === activePage ? 'active' : ''} aria-label={`Show one day trip slide ${index + 1}`} key={index} onClick={() => setActivePage(index)} />
        ))}
      </div>
    </section>
  );
}
