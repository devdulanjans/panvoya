import Head from 'next/head';
import SiteHeader from '../components/SiteHeader';
import HeroSlider from '../components/HeroSlider';
import SiteFooter from '../components/SiteFooter';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import TravelStats from '../components/TravelStats';
import { useContact } from '../components/ContactContext';
import { getPublicHomepageData } from '../lib/publicContent';
import sectionStyles from './CorporateTravel.module.css';
import styles from './AboutUs.module.css';

export async function getServerSideProps() {
  const homepageData = await getPublicHomepageData();

  return {
    props: {
      searchIndex: homepageData.searchIndex,
      packagesNavChildren: homepageData.packagesNavChildren,
      travelStats: homepageData.travelStats,
      navVisibility: homepageData.navVisibility,
      stickyHeader: homepageData.stickyHeader,
      heroSlides: homepageData.heroSlidesByPage['about-us'] || [],
      aboutStory: homepageData.aboutStory,
      aboutCta: homepageData.aboutCta,
      aboutValues: homepageData.aboutValues,
      aboutValuesHeading: homepageData.headings.aboutValues,
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
    },
  };
}

const DEFAULT_STORY = {
  eyebrow: 'Our Story',
  heading: 'Built on a Passion for Travel',
  paragraph1:
    "Panvoya was founded with a simple goal: to make travel planning effortless, personal, and memorable. From day trips along Sri Lanka's coastline to international getaways and group tours, our team works closely with every traveler to design journeys that fit their story.",
  paragraph2:
    'What started as a small team of travel enthusiasts has grown into a full-service agency handling everything from flights and accommodation to visas and corporate travel — always with the same attention to detail we started with.',
  image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_CTA = {
  heading: 'Ready to Start Planning Your Next Trip?',
  text: 'Tell us where you want to go, and our team will take care of the rest — from the first idea to the final itinerary.',
  image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_VALUES = [
  { title: 'Our Mission', description: 'To connect travelers with experiences that inspire, relax, and create lasting memories.' },
  { title: 'Our Vision', description: "To be Sri Lanka's most trusted travel partner for both leisure and corporate journeys." },
  { title: 'Customer First', description: 'Every itinerary is built around what matters most to you — your time, your budget, and your interests.' },
  { title: 'Local Expertise', description: "Our team's deep knowledge of local destinations means better recommendations and smoother trips." },
];

export default function AboutUsPage({
  searchIndex,
  packagesNavChildren,
  travelStats,
  navVisibility,
  heroSlides,
  aboutStory,
  aboutCta,
  aboutValues,
  aboutValuesHeading,
  stickyHeader,
}) {
  const { whatsapp, email } = useContact();
  const story = { ...DEFAULT_STORY, ...aboutStory };
  const cta = { ...DEFAULT_CTA, ...aboutCta };
  const values = aboutValues && aboutValues.length > 0 ? aboutValues : DEFAULT_VALUES;
  const whatsappLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I'd like to know more about Panvoya.")}`;

  return (
    <div className="page-shell" id="top">
      <Head>
        <title>About Us | Panvoya</title>
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider
        slides={heroSlides}
        fallbackTitle="About Panvoya"
        fallbackDescription="Your trusted travel partner for unforgettable journeys across Sri Lanka and beyond."
      />

      <section className={sectionStyles.section}>
        <div className={styles.storyGrid}>
          <img src={story.image} alt="Panvoya team planning a trip" className={styles.storyImage} />
          <div>
            <span className={styles.storyEyebrow}>{story.eyebrow}</span>
            <h2 className={styles.storyHeading}>{story.heading}</h2>
            <p className={styles.storyText}>{story.paragraph1}</p>
            <p className={styles.storyText}>{story.paragraph2}</p>
          </div>
        </div>
      </section>

      <section className={`${sectionStyles.section} ${sectionStyles.sectionAlt}`}>
        <div className={sectionStyles.sectionInner}>
          <span className={sectionStyles.eyebrow}>What We Stand For</span>
          <h2 className={sectionStyles.sectionHeading}>{aboutValuesHeading?.title || 'Our Mission & Values'}</h2>
          <p className={sectionStyles.sectionSubtitle}>
            {aboutValuesHeading?.subtitle || 'The principles that guide every itinerary we build and every trip we help plan.'}
          </p>
          <div className={sectionStyles.whyGrid}>
            {values.map((value) => (
              <div className={sectionStyles.whyCard} key={value.id || value.title}>
                <h3 className={sectionStyles.whyTitle}>{value.title}</h3>
                <p className={sectionStyles.whyText}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TravelStats stats={travelStats} />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.ctaBanner}>
          <img src={cta.image} alt="Plan your next trip" className={sectionStyles.ctaImage} />
          <div className={sectionStyles.ctaCopy}>
            <h2>{cta.heading}</h2>
            <p>{cta.text}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className={sectionStyles.ctaButton}>
                Chat on WhatsApp
              </a>
              <a href={`mailto:${email}`} className={sectionStyles.ctaButton}>
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
