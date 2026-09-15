import Head from 'next/head';
import SiteHeader from '../../components/SiteHeader';
import HeroSlider from '../../components/HeroSlider';
import SiteFooter from '../../components/SiteFooter';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import PackageListCard from '../../components/PackageListCard';
import { query, mapContentItem } from '../../lib/db';
import { getPublicHomepageData } from '../../lib/publicContent';
import styles from './AllPackages.module.css';

export async function getServerSideProps() {
  const [homepageData, rawItems] = await Promise.all([
    getPublicHomepageData(),
    query('SELECT * FROM `ContentItem` WHERE section = ? ORDER BY position ASC', ['tourPackages']),
  ]);
  const items = rawItems.map(mapContentItem);

  const packages = items
    .filter((item) => item.data.status === 'Public')
    .map((item) => ({
      id: item.id,
      slug: item.slug || String(item.id),
      title: item.data.title,
      category: item.data.category,
      duration: item.data.duration || '',
      image: item.data.bannerImage || '',
      description: item.data.description || '',
      inclusions: item.data.inclusions || [],
      itinerary: item.data.itinerary || [],
      currencies: item.data.currency || [],
      prices: item.data.priceTiers?.[0]?.prices || {},
      minHeadCount: item.data.minHeadCount || '',
      groupPricePerHead: item.data.groupPricePerHead || {},
    }));

  return {
    props: {
      packages,
      searchIndex: homepageData.searchIndex,
      packagesNavChildren: homepageData.packagesNavChildren,
      navVisibility: homepageData.navVisibility,
      stickyHeader: homepageData.stickyHeader,
      heroSlides: homepageData.heroSlidesByPage.packages || [],
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
    },
  };
}

export default function AllPackagesPage({ packages, searchIndex, packagesNavChildren, navVisibility, heroSlides, stickyHeader }) {
  return (
    <div className="page-shell" id="top">
      <Head>
        <title>All Travel Packages | Panvoya</title>
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider slides={heroSlides} fallbackTitle="All Travel Packages" fallbackDescription="Browse every tour package we currently offer." />

      <div className={styles.page}>
        <header className={styles.pageHeading}>
          <h1 className={styles.pageTitle}>All Travel Packages</h1>
          <p className={styles.pageSubtitle}>Browse every tour package we currently offer.</p>
        </header>

        {packages.length === 0 ? (
          <p className={styles.empty}>No packages are available right now — check back soon.</p>
        ) : (
          <div className={styles.list}>
            {packages.map((pkg) => (
              <PackageListCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
