import { useState } from 'react';
import Head from 'next/head';
import SiteHeader from '../components/SiteHeader';
import HeroSlider from '../components/HeroSlider';
import SiteFooter from '../components/SiteFooter';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { useContact } from '../components/ContactContext';
import { getPublicHomepageData } from '../lib/publicContent';
import sectionStyles from './CorporateTravel.module.css';
import styles from './ContactUs.module.css';

export async function getServerSideProps() {
  const homepageData = await getPublicHomepageData();

  return {
    props: {
      searchIndex: homepageData.searchIndex,
      packagesNavChildren: homepageData.packagesNavChildren,
      navVisibility: homepageData.navVisibility,
      stickyHeader: homepageData.stickyHeader,
      heroSlides: homepageData.heroSlidesByPage['contact-us'] || [],
      contactDetails: homepageData.contactDetails,
      primaryContact: homepageData.primaryContact,
      footerLinks: homepageData.footerLinks,
      contactHeading: homepageData.headings.contactDetails,
    },
  };
}

const TYPE_META = {
  Phone: { icon: '☏', label: 'Phone', href: (value) => `tel:${value.replace(/\s+/g, '')}` },
  WhatsApp: { icon: '◉', label: 'WhatsApp', href: (value) => `https://wa.me/${value.replace(/\s+/g, '')}` },
  Email: { icon: '✉', label: 'Email', href: (value) => `mailto:${value}` },
  Address: { icon: '⌂', label: 'Address', href: null },
};

const TYPE_ORDER = ['Phone', 'WhatsApp', 'Email', 'Address'];

export default function ContactUsPage({ searchIndex, packagesNavChildren, navVisibility, heroSlides, contactDetails, contactHeading, stickyHeader }) {
  const { whatsapp } = useContact();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const detailsByType = TYPE_ORDER.map((type) => ({
    type,
    entries: (contactDetails || []).filter((entry) => entry.type === type),
  })).filter((group) => group.entries.length > 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    const lines = [
      'Hi, I would like to get in touch with Panvoya.',
      form.name && `Name: ${form.name}`,
      form.email && `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      form.message && `Message: ${form.message}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-shell" id="top">
      <Head>
        <title>Contact Us | Panvoya</title>
      </Head>

      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider
        slides={heroSlides}
        fallbackTitle="Contact Us"
        fallbackDescription="We're here to help plan your next journey — reach out any way that suits you."
      />

      {detailsByType.length > 0 && (
        <section className={sectionStyles.section}>
          <div className={sectionStyles.sectionInner}>
            <span className={sectionStyles.eyebrow}>Get In Touch</span>
            <h2 className={sectionStyles.sectionHeading}>{contactHeading?.title || 'Contact Details'}</h2>
            {contactHeading?.subtitle && <p className={sectionStyles.sectionSubtitle}>{contactHeading.subtitle}</p>}
          </div>
          <div className={styles.detailsGrid}>
            {detailsByType.map((group) => {
              const meta = TYPE_META[group.type];
              return (
                <div className={styles.detailCard} key={group.type}>
                  <span className={styles.detailIcon} aria-hidden="true">{meta.icon}</span>
                  <h3 className={styles.detailType}>{meta.label}</h3>
                  {group.entries.map((entry) => (
                    <div className={styles.detailEntry} key={entry.id}>
                      {entry.label && <span className={styles.detailLabel}>{entry.label}</span>}
                      {meta.href ? (
                        <a
                          href={meta.href(entry.value)}
                          target={group.type === 'WhatsApp' ? '_blank' : undefined}
                          rel={group.type === 'WhatsApp' ? 'noreferrer' : undefined}
                          className={styles.detailValue}
                        >
                          {entry.value}
                        </a>
                      ) : (
                        <span className={styles.detailValue}>{entry.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className={`${sectionStyles.section} ${sectionStyles.sectionAlt}`}>
        <div className={sectionStyles.contactGrid}>
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=800&q=80"
            alt="Get in touch with Panvoya"
            className={sectionStyles.contactImage}
          />
          <div className={sectionStyles.contactCopy}>
            <h2>Send Us a Message</h2>
            <p>Tell us what you need and we&apos;ll get back to you on WhatsApp as soon as possible.</p>
            <form className={sectionStyles.contactForm} onSubmit={handleSubmit}>
              <div className={sectionStyles.contactFormRow}>
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div className={sectionStyles.contactFormRow}>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <textarea
                rows={4}
                placeholder="How can we help?"
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              />
              <button type="submit">Send via WhatsApp</button>
              <p className={sectionStyles.contactNote}>We usually respond within one working day.</p>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
