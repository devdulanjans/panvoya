import Link from 'next/link';
import { CURRENCY_SYMBOLS, hasRichContent } from '../lib/packageSchema';
import { useContact } from './ContactContext';
import styles from '../pages/packages/AllPackages.module.css';

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

function whatsappLink(title, whatsappNumber) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, Can I get more details for ${title}`)}`;
}

export default function PackageListCard({ pkg }) {
  const { whatsapp, phone } = useContact();
  const highlightItems = pkg.inclusions.length > 0
    ? pkg.inclusions
    : pkg.itinerary.filter((day) => day.title).map((day) => day.title);

  const isGroupTour = pkg.category === 'Group Tours';
  const groupCurrency = isGroupTour
    ? pkg.currencies.find((currency) => pkg.groupPricePerHead[currency])
    : null;
  const firstCurrency = pkg.currencies.find((currency) => pkg.prices[currency]);

  return (
    <article className={styles.card}>
      <Link href={`/packages/${pkg.slug}`} className={styles.imageLink} onClick={() => trackClick(pkg.id)}>
        <img src={pkg.image} alt={pkg.title} className={styles.image} />
      </Link>

      <div className={styles.details}>
        <div className={styles.detailsHeader}>
          <Link href={`/packages/${pkg.slug}`} className={styles.title} onClick={() => trackClick(pkg.id)}>
            {pkg.title}
          </Link>
          {pkg.duration && <span className={styles.duration}>{pkg.duration}</span>}
        </div>

        {highlightItems.length > 0 ? (
          <>
            <h2 className={styles.detailsLabel}>Package Details</h2>
            <ul className={styles.detailsList}>
              {highlightItems.map((item, index) => (
                <li key={index}>
                  <span className={styles.detailsIcon} aria-hidden="true">➤</span> {item}
                </li>
              ))}
            </ul>
          </>
        ) : hasRichContent(pkg.description) ? (
          <>
            <h2 className={styles.detailsLabel}>Package Details</h2>
            <div className={styles.detailsText} dangerouslySetInnerHTML={{ __html: pkg.description }} />
          </>
        ) : null}
      </div>

      <div className={styles.sidebar}>
        {isGroupTour && groupCurrency ? (
          <>
            <p className={styles.sidebarLabel}>Price per head</p>
            <p className={styles.sidebarPrice}>
              {CURRENCY_SYMBOLS[groupCurrency] || `${groupCurrency} `}
              {pkg.groupPricePerHead[groupCurrency]}
            </p>
            {pkg.minHeadCount && <p className={styles.sidebarLabel}>Min. {pkg.minHeadCount} pax</p>}
          </>
        ) : firstCurrency ? (
          <>
            <p className={styles.sidebarLabel}>Starting from</p>
            <p className={styles.sidebarPrice}>
              {CURRENCY_SYMBOLS[firstCurrency] || `${firstCurrency} `}
              {pkg.prices[firstCurrency]} <small>PP</small>
            </p>
          </>
        ) : (
          <p className={styles.sidebarQuote}>Request a Quote</p>
        )}
        <a
          href={whatsappLink(pkg.title, whatsapp)}
          target="_blank"
          rel="noreferrer"
          className={styles.inquiryButton}
          onClick={() => trackClick(pkg.id)}
        >
          Submit Inquiry
        </a>
        <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.callButton}>
          Call Now<br /><strong>{phone}</strong>
        </a>
      </div>
    </article>
  );
}
