import Head from 'next/head';
import SiteHeader from '../../components/SiteHeader';
import HeroSlider from '../../components/HeroSlider';
import SiteFooter from '../../components/SiteFooter';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import PackageListCard from '../../components/PackageListCard';
import { prisma } from '../../lib/prisma';
import { getPublicHomepageData } from '../../lib/publicContent';
import styles from './AllPackages.module.css';

export async function getServerSideProps() {
  const [homepageData, items] = await Promise.all([
    getPublicHomepageData(),
    prisma.contentItem.findMany({ where: { section: 'tourPackages' }, orderBy: { position: 'asc' } }),
  ]);

  const packages = items
    .filter((item) => item.data.status === 'Public' && item.data.category === 'Group Tours')
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
      heroSlides: homepageData.heroSlidesByPage['group-tours'] || [],
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
    },
  };
}

export default function GroupToursPage({ packages, searchIndex, packagesNavChildren, navVisibility, heroSlides, stickyHeader }) {
  return (
    <div className="page-shell" id="top">
      <Head>
        <title>Group Tours | Panvoya</title>
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider slides={heroSlides} fallbackTitle="Group Tours" fallbackDescription="Travel packages designed for groups, priced per head." />

      <div className={styles.page}>
        <header className={styles.pageHeading}>
          <h1 className={styles.pageTitle}>Group Tours</h1>
          <p className={styles.pageSubtitle}>Travel packages designed for groups, priced per head.</p>
        </header>

        {packages.length === 0 ? (
          <p className={styles.empty}>No group tours are available right now — check back soon.</p>
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
