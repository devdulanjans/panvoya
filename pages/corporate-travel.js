import { useState } from 'react';
import Head from 'next/head';
import SiteHeader from '../components/SiteHeader';
import HeroSlider from '../components/HeroSlider';
import SiteFooter from '../components/SiteFooter';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import PackageListCard from '../components/PackageListCard';
import TrustedPartners from '../components/TrustedPartners';
import { useContact } from '../components/ContactContext';
import { query, mapContentItem } from '../lib/db';
import { getPublicHomepageData } from '../lib/publicContent';
import listStyles from './packages/AllPackages.module.css';
import styles from './CorporateTravel.module.css';

export async function getServerSideProps() {
  const [homepageData, rawItems] = await Promise.all([
    getPublicHomepageData(),
    query('SELECT * FROM `ContentItem` WHERE section = ? ORDER BY position ASC', ['tourPackages']),
  ]);
  const items = rawItems.map(mapContentItem);

  const packages = items
    .filter((item) => item.data.status === 'Public' && item.data.category === 'Corporate Travel')
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
      trustedPartners: homepageData.trustedPartners,
      navVisibility: homepageData.navVisibility,
      stickyHeader: homepageData.stickyHeader,
      heroSlides: homepageData.heroSlidesByPage['corporate-travel'] || [],
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
    },
  };
}

function whatsappLink(message, whatsappNumber) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const solutions = [
  {
    title: 'Incentive Travel Programmes',
    description: 'Reward and recognition travel experiences designed to motivate employees and celebrate achievements.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'International Corporate Tours',
    description: 'Customised overseas travel programmes for corporate groups, conferences, exhibitions, and business delegations.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Corporate Tours Across Sri Lanka',
    description: 'Company outings, annual trips, staff welfare programmes, and team travel experiences island-wide.',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=700&q=80',
  },
];

const services = [
  'Flight Reservations',
  'Hotel Bookings',
  'Visa Assistance',
  'Travel Insurance',
  'Airport Transfers',
  'Executive & VIP Travel',
  'MICE Services',
  'Events & Exhibitions',
  'Travel Policy Management',
  'Group Travel Management',
];

const steps = [
  { title: 'Tell Us What You Need', description: 'Share your travel requirements, headcount, and deadlines.' },
  { title: 'Review Your Options', description: 'We present tailored solutions that fit your budget and schedule.' },
  { title: 'Confirm Your Arrangements', description: 'Confirm bookings and receive all your travel details.' },
  { title: 'Travel With Confidence', description: 'Our support continues throughout your journey.' },
];

const whyChooseUs = [
  { title: 'Dedicated Support', description: 'A single point of contact who understands your business and travel needs.' },
  { title: 'Faster Turnaround Times', description: 'Quick responses and immediate solutions when plans need adjusting.' },
  { title: 'End-to-End Coordination', description: 'From initial planning to airport drop-off, we handle everything.' },
  { title: 'Flexible Assistance', description: 'Travel arrangements that work with your schedule and budget.' },
];

const faqs = [
  {
    question: 'Why is MICE travel important for businesses?',
    answer: 'MICE (Meetings, Incentives, Conferences, and Exhibitions) travel helps businesses strengthen relationships, reward employees, and create opportunities for growth through meetings, incentives, conferences, and exhibitions.',
  },
  {
    question: 'What benefits does Panvoya provide for corporate clients?',
    answer: 'Corporate clients get a dedicated coordinator, flexible billing, priority support, and tailored itineraries built around your organisation’s schedule and budget.',
  },
  {
    question: 'Does Panvoya focus on corporate travel specifically?',
    answer: 'Corporate travel is one of our core services alongside our regular tour packages — we have a dedicated process for managing business and group travel requirements.',
  },
  {
    question: 'Do you offer both inbound and outbound corporate travel services?',
    answer: 'Yes, we arrange corporate travel both within Sri Lanka and internationally, depending on your organisation’s needs.',
  },
  {
    question: 'What types of corporate tours do you provide?',
    answer: 'We arrange incentive trips, conferences, staff outings, annual company trips, and international business delegations.',
  },
];

export default function CorporateTravelPage({ packages, searchIndex, packagesNavChildren, trustedPartners, navVisibility, heroSlides, stickyHeader }) {
  const { whatsapp, phone, email } = useContact();
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const lines = [
      'Hi, I would like to discuss a corporate travel requirement.',
      form.name && `Name: ${form.name}`,
      form.company && `Company: ${form.company}`,
      form.email && `Work Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      form.message && `Details: ${form.message}`,
    ].filter(Boolean);
    window.open(whatsappLink(lines.join('\n'), whatsapp), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-shell" id="top">
      <Head>
        <title>Corporate Travel | Panvoya</title>
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider
        slides={heroSlides}
        fallbackTitle="Corporate Travel"
        fallbackDescription="Travel packages tailored for corporate and business trips."
      />

      <div className={listStyles.page}>
        <header className={listStyles.pageHeading}>
          <h1 className={listStyles.pageTitle}>Corporate Travel</h1>
          <p className={listStyles.pageSubtitle}>Travel packages tailored for corporate and business trips.</p>
        </header>

        {packages.length === 0 ? (
          <p className={listStyles.empty}>No corporate travel packages are available right now — check back soon.</p>
        ) : (
          <div className={listStyles.list}>
            {packages.map((pkg) => (
              <PackageListCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      <section
        className={styles.hero}
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className={styles.heroInner}>
          <h2 className={styles.heroTitle}>Simplifying Corporate Travel for Businesses Across Sri Lanka</h2>
          <p className={styles.heroSubtitle}>
            Managing business travel involves more than booking flights. Panvoya provides end-to-end corporate travel
            solutions — flights, hotels, ground transport, and visa support — handled by a dedicated team that
            understands modern business travel.
          </p>
          <div className={styles.heroActions}>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={`${styles.heroButton} ${styles.heroButtonSecondary}`}>
              Call {phone}
            </a>
            <a
              href={whatsappLink('Hi, I would like to discuss a corporate travel requirement.', whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={`${styles.heroButton} ${styles.heroButtonPrimary}`}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.aboutGrid}>
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
            alt="Business travellers"
            className={styles.aboutImage}
          />
          <div>
            <span className={styles.aboutEyebrow}>About Us</span>
            <h2 className={styles.aboutHeading}>Travel Solutions Built Around Your Business</h2>
            <p className={styles.aboutText}>
              Panvoya partners with organisations across Sri Lanka to plan, coordinate, and manage corporate travel
              requirements. From individual business trips to large-scale group travel, we work closely with your
              team to design arrangements that align with your schedules, budgets, and operational needs, making
              travel planning simpler and more efficient for everyone involved.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>Our Solutions</span>
          <h2 className={styles.sectionHeading}>Corporate Travel Solutions</h2>
          <p className={styles.sectionSubtitle}>We provide a range of travel services designed to support organisations and their employees.</p>
          <div className={styles.solutionsGrid}>
            {solutions.map((solution) => (
              <article className={styles.solutionCard} key={solution.title}>
                <img src={solution.image} alt={solution.title} className={styles.solutionImage} />
                <div className={styles.solutionBody}>
                  <h3 className={styles.solutionTitle}>{solution.title}</h3>
                  <p className={styles.solutionText}>{solution.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.contactGrid}>
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
            alt="Discussing travel requirements"
            className={styles.contactImage}
          />
          <div className={styles.contactCopy}>
            <h2>Let&apos;s Discuss Your Travel Requirements</h2>
            <p>Whether you&apos;re planning business travel, a conference, or a group trip, we&apos;re here to help you find the right solution.</p>
            <form className={styles.contactForm} onSubmit={handleFormSubmit}>
              <div className={styles.contactFormRow}>
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Company / Organisation"
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                />
              </div>
              <div className={styles.contactFormRow}>
                <input
                  type="email"
                  placeholder="Work Email *"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <textarea
                rows={4}
                placeholder="Tell us a little more: venue needs, accommodation level, activities, transport, special requests, etc."
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              />
              <button type="submit">Get Corporate Travel Assistance</button>
              <p className={styles.contactNote}>We usually respond within one working day.</p>
            </form>
          </div>
        </div>
      </section>

      <TrustedPartners partners={trustedPartners} heading="Trusted by Leading Organisations" />

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>Our Services</span>
          <h2 className={styles.sectionHeading}>Comprehensive Corporate Travel Management</h2>
          <p className={styles.sectionSubtitle}>Everything you need to plan, coordinate, and manage business travel in one place.</p>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div className={styles.serviceTag} key={service}>{service}</div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionHeading} style={{ marginBottom: 44 }}>Simple, Straightforward, and Built Around Your Requirements</h2>
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div className={styles.stepCard} key={step.title}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.ctaBanner}>
          <img
            src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
            alt="Corporate travel planning"
            className={styles.ctaImage}
          />
          <div className={styles.ctaCopy}>
            <h2>Ready to Discuss Your Travel Needs?</h2>
            <p>
              Whether you&apos;re planning business travel, a corporate tour, or an incentive trip, our team will
              provide tailored recommendations and dedicated support to help you find the right solution.
            </p>
            <a href={`mailto:${email}`} className={styles.ctaButton}>Email Us Your Requirements</a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>Why Panvoya</span>
          <h2 className={styles.sectionHeading}>Why Businesses Choose Panvoya</h2>
          <p className={styles.sectionSubtitle}>
            The right travel partner isn&apos;t simply someone who makes bookings. It&apos;s someone who helps reduce
            uncertainty when plans change.
          </p>
          <div className={styles.whyGrid}>
            {whyChooseUs.map((item) => (
              <div className={styles.whyCard} key={item.title}>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyText}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div className={styles.faqItem} key={faq.question}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <span className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ''}`} aria-hidden="true">⌄</span>
                  </button>
                  {isOpen && <p className={styles.faqAnswer}>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
