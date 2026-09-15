import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PackagePriceList from './PackagePriceList';
import PackageImageSlider from './PackageImageSlider';
import { useContact } from './ContactContext';

function buildImages(item) {
  return [item.image, ...(item.gallery || [])].filter((src, index, arr) => src && arr.indexOf(src) === index);
}

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

export default function PopularPackages({ packages = [], heading, subtitle }) {
  const router = useRouter();
  const { whatsapp } = useContact();
  const displayHeading = heading || 'Popular Travel Packages';
  const [activePage, setActivePage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(packages.length / 6));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePage((page) => (page + 1) % pageCount);
    }, 6000);

    return () => clearInterval(interval);
  }, [pageCount]);

  if (packages.length === 0) return null;

  const openPackage = (item) => {
    trackClick(item.id);
    router.push(`/packages/${item.slug}`);
  };

  return (
    <section className="popular-packages" aria-labelledby="popular-packages-heading">
      <header className="popular-packages-heading">
        <h2 id="popular-packages-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="package-cards">
        {packages.map((item) => (
          <article
            className="package-card"
            key={item.id}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => openPackage(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openPackage(item);
            }}
          >
            <div className="package-image">
              <PackageImageSlider images={buildImages(item)} alt={`${item.title} destination`} />
              <span className="package-badge">{item.category}</span>
            </div>
            <div className="package-card-body">
              <h3>{item.title}</h3>
              <p className="package-meta"><span>⌾ {item.duration}</span></p>
              <div className="package-action">
                <div className="package-action-buttons">
                  <a
                    href={`/packages/${item.slug}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      trackClick(item.id);
                    }}
                  >
                    More Details ↗
                  </a>
                  <a
                    href={reservationLink(item.title, whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="package-reserve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackClick(item.id);
                    }}
                  >
                    Reservation
                  </a>
                </div>
                <PackagePriceList currencies={item.currencies} prices={item.prices} />
              </div>
              <div className="package-features"><span>◈ Experience ⓘ</span><span>◉ Inclusion ⓘ</span></div>
            </div>
          </article>
        ))}
      </div>
      <div className="package-dots" aria-label="Popular package slides">
        {Array.from({ length: pageCount }, (_, index) => (
          <button type="button" className={index === activePage ? 'active' : ''} aria-label={`Show package slide ${index + 1}`} key={index} onClick={() => setActivePage(index)} />
        ))}
      </div>
    </section>
  );
}
