import { useState } from 'react';
import Head from 'next/head';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import PackagePriceList from '../../components/PackagePriceList';
import { useContact } from '../../components/ContactContext';
import { queryOne, mapContentItem } from '../../lib/db';
import { getPublicHomepageData } from '../../lib/publicContent';
import { CURRENCY_SYMBOLS, hasRichContent } from '../../lib/packageSchema';
import PackageGallery from '../../components/PackageGallery';
import styles from './PackageDetail.module.css';

export async function getServerSideProps(context) {
  const { slug } = context.params;

  const [homepageData, rawItem] = await Promise.all([
    getPublicHomepageData(),
    queryOne('SELECT * FROM `contentitem` WHERE slug = ?', [slug]),
  ]);
  const item = mapContentItem(rawItem);

  if (!item || item.section !== 'tourPackages' || item.data.status !== 'Public') {
    return { notFound: true };
  }

  const pkg = { id: item.id, slug: item.slug, ...item.data };
  const related = homepageData.popularPackages.filter((p) => p.id !== item.id).slice(0, 3);

  return {
    props: {
      pkg,
      related,
      searchIndex: homepageData.searchIndex,
      packagesNavChildren: homepageData.packagesNavChildren,
      navVisibility: homepageData.navVisibility,
      stickyHeader: homepageData.stickyHeader,
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
    },
  };
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

function whatsappLink(title, whatsappNumber) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, Can I get more details for ${title}`)}`;
}

export default function PackageDetailPage({ pkg, related, searchIndex, packagesNavChildren, navVisibility, stickyHeader }) {
  const { whatsapp } = useContact();
  const [openDays, setOpenDays] = useState(() => new Set([0]));

  const toggleDay = (index) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => setOpenDays(new Set(pkg.itinerary.map((_, i) => i)));
  const collapseAll = () => setOpenDays(new Set());
  const allExpanded = pkg.itinerary.length > 0 && openDays.size === pkg.itinerary.length;

  const isGroupTour = pkg.category === 'Group Tours';
  const firstPriceTier = pkg.priceTiers?.[0];
  const currencies = pkg.currency || [];
  const prices = isGroupTour ? (pkg.groupPricePerHead || {}) : (firstPriceTier?.prices || {});
  const firstAvailableCurrency = currencies.find((c) => prices[c]);

  const handleEnquire = () => trackClick(pkg.id);

  return (
    <div className="page-shell" id="top">
      <Head>
        <title>{pkg.title} | Panvoya</title>
        {pkg.seoKeywords && <meta name="keywords" content={pkg.seoKeywords} />}
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <section className={styles.hero} style={{ backgroundImage: pkg.bannerImage ? `url(${pkg.bannerImage})` : undefined }}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>{pkg.category}</span>
            {pkg.tourArea && <span className={styles.heroBadge}>{pkg.tourArea}</span>}
            <span className={styles.heroBadge}>{pkg.tripLength}</span>
          </div>
          {firstAvailableCurrency && (
            <span className={styles.heroPriceTag}>
              {isGroupTour ? 'Price per head' : 'Starting from'} {CURRENCY_SYMBOLS[firstAvailableCurrency] || `${firstAvailableCurrency} `}
              {prices[firstAvailableCurrency]}
              {isGroupTour ? '' : ' / per person'}
            </span>
          )}
          <h1 className={styles.heroTitle}>{pkg.title}</h1>
          {pkg.duration && <p className={styles.heroMeta}>{pkg.duration}</p>}
        </div>
      </section>

      <div className={styles.layout}>
        <div>
          {hasRichContent(pkg.description) && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>About Tour Package</h2>
              <div className={styles.description} dangerouslySetInnerHTML={{ __html: pkg.description }} />
              <div className={styles.factsGrid}>
                <div className={styles.factItem}>
                  <span className={styles.factIcon} aria-hidden="true">◈</span>
                  <span>
                    <span className={styles.factLabel}>Category</span>
                    <span className={styles.factValue}>{pkg.category}</span>
                  </span>
                </div>
                <div className={styles.factItem}>
                  <span className={styles.factIcon} aria-hidden="true">⌾</span>
                  <span>
                    <span className={styles.factLabel}>Trip Length</span>
                    <span className={styles.factValue}>{pkg.tripLength}</span>
                  </span>
                </div>
                {pkg.duration && (
                  <div className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">◉</span>
                    <span>
                      <span className={styles.factLabel}>Duration</span>
                      <span className={styles.factValue}>{pkg.duration}</span>
                    </span>
                  </div>
                )}
                {pkg.tourArea && (
                  <div className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">✪</span>
                    <span>
                      <span className={styles.factLabel}>Tour Area</span>
                      <span className={styles.factValue}>{pkg.tourArea}</span>
                    </span>
                  </div>
                )}
                {pkg.hotels?.[0]?.term && (
                  <div className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">▣</span>
                    <span>
                      <span className={styles.factLabel}>Accommodation</span>
                      <span className={styles.factValue}>{pkg.hotels[0].term}</span>
                    </span>
                  </div>
                )}
                {isGroupTour && pkg.minHeadCount && (
                  <div className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">▣</span>
                    <span>
                      <span className={styles.factLabel}>Minimum Head Count</span>
                      <span className={styles.factValue}>{pkg.minHeadCount}</span>
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {pkg.gallery?.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Gallery</h2>
              <PackageGallery images={pkg.gallery} title={pkg.title} />
            </section>
          )}

          {pkg.itinerary?.length > 0 && (
            <section className={styles.card}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Tour Itinerary</h2>
                <button type="button" className={styles.expandAllButton} onClick={allExpanded ? collapseAll : expandAll}>
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
              <div className={styles.itineraryList}>
                {pkg.itinerary.map((day, index) => {
                  const isOpen = openDays.has(index);
                  return (
                    <div className={styles.itineraryDay} key={index}>
                      <button type="button" className={styles.itineraryDayHeader} onClick={() => toggleDay(index)} aria-expanded={isOpen}>
                        <span>{day.day} — {day.title}</span>
                        <span className={`${styles.itineraryDayArrow} ${isOpen ? styles.itineraryDayArrowOpen : ''}`} aria-hidden="true">⌄</span>
                      </button>
                      {isOpen && (
                        <div className={styles.itineraryDayBody}>
                          {day.image && <img src={day.image} alt={day.title} className={styles.itineraryDayImage} />}
                          {day.overnight && <p className={styles.itineraryOvernight}>⌾ Overnight: {day.overnight}</p>}
                          {day.description && <p className={styles.itineraryDescription}>{day.description}</p>}
                          {day.activities?.length > 0 && (
                            <ul className={styles.activityList}>
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>• {activity}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {pkg.hotels?.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Where You&apos;ll Stay</h2>
              <div className={styles.hotelGrid}>
                {pkg.hotels.map((hotel, index) => (
                  <div className={styles.hotelCard} key={index}>
                    {hotel.featuredImage && <img src={hotel.featuredImage} alt={hotel.hotelName} className={styles.hotelImage} />}
                    <div className={styles.hotelBody}>
                      {hotel.term && <span className={styles.hotelTerm}>{hotel.term}</span>}
                      <h3 className={styles.hotelName}>{hotel.hotelName}</h3>
                      {hotel.description && <p className={styles.hotelDescription}>{hotel.description}</p>}
                      {hotel.gallery?.length > 0 && (
                        <div className={styles.hotelGallery}>
                          {hotel.gallery.map((url, galleryIndex) => (
                            <img key={galleryIndex} src={url} alt="" className={styles.hotelGalleryThumb} />
                          ))}
                        </div>
                      )}
                      {hotel.bookingLink && (
                        <a href={hotel.bookingLink} target="_blank" rel="noreferrer" className={styles.hotelLink}>
                          View Hotel ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pkg.mapImage && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Package Destination Map</h2>
              <img src={pkg.mapImage} alt={`${pkg.title} destination map`} className={styles.mapImage} />
            </section>
          )}

          {(pkg.inclusions?.length > 0 || pkg.exclusions?.length > 0) && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Package Features List</h2>
              <div className={styles.featuresGrid}>
                {pkg.inclusions?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Include Features</h3>
                    <ul className={styles.featureList}>
                      {pkg.inclusions.map((item, index) => (
                        <li key={index}><span className={styles.includeIcon}>✓</span> {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {pkg.exclusions?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Exclude Features</h3>
                    <ul className={styles.featureList}>
                      {pkg.exclusions.map((item, index) => (
                        <li key={index}><span className={styles.excludeIcon}>✕</span> {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        <aside className={styles.sidebar}>
          <div className={styles.priceCard}>
            <p className={styles.priceCardLabel}>{isGroupTour ? 'Price per head' : 'Starting from'}</p>
            <div className={styles.priceCardAmounts}>
              {currencies.filter((c) => prices[c]).map((currency) => (
                <span className={styles.priceCardAmount} key={currency}>
                  {CURRENCY_SYMBOLS[currency] || `${currency} `}
                  {prices[currency]}
                </span>
              ))}
            </div>
            {isGroupTour && pkg.minHeadCount && (
              <p className={styles.trustNote} style={{ marginTop: -8, marginBottom: 8 }}>
                Minimum {pkg.minHeadCount} pax
              </p>
            )}
            <a
              href={whatsappLink(pkg.title, whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={styles.enquireButton}
              onClick={handleEnquire}
            >
              Enquire on WhatsApp
            </a>
            <p className={styles.trustNote}>We usually reply within a few hours.</p>
          </div>

          <div className={styles.customCard}>
            <h3>Want a custom itinerary?</h3>
            <p>Tell us your dates and preferences — we&apos;ll tailor this package for you.</p>
            <a href={whatsappLink(pkg.title, whatsapp)} target="_blank" rel="noreferrer" onClick={handleEnquire}>
              Customize Package
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedSectionInner}>
            <h2 className={styles.relatedHeading}>Relevant Package</h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <a
                  key={item.id}
                  href={`/packages/${item.slug}`}
                  className={styles.relatedCard}
                  onClick={() => trackClick(item.id)}
                >
                  <img src={item.image} alt={item.title} className={styles.relatedImage} />
                  <div className={styles.relatedBody}>
                    <h3 className={styles.relatedTitle}>{item.title}</h3>
                    <PackagePriceList currencies={item.currencies} prices={item.prices} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
