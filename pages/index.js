import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import HeroSlider from '../components/HeroSlider';
import { useContact } from '../components/ContactContext';
import DiscountCarousel from '../components/DiscountCarousel';
import FeaturedDestinations from '../components/FeaturedDestinations';
import ServiceBenefits from '../components/ServiceBenefits';
import PopularPackages from '../components/PopularPackages';
import TravelQuoteBanner from '../components/TravelQuoteBanner';
import LastMinuteDeals from '../components/LastMinuteDeals';
import CustomTravelPackage from '../components/CustomTravelPackage';
import TrustedPartners from '../components/TrustedPartners';
import OneDayTrips from '../components/OneDayTrips';
import TravelInspirations from '../components/TravelInspirations';
import TravelerTestimonials from '../components/TravelerTestimonials';
import GeneralQuestions from '../components/GeneralQuestions';
import TravelStats from '../components/TravelStats';
import SiteFooter from '../components/SiteFooter';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { getPublicHomepageData } from '../lib/publicContent';

export async function getServerSideProps() {
  const data = await getPublicHomepageData();
  return { props: data };
}

export default function Home({
  heroSlidesByPage,
  popularPackages,
  oneDayTrips,
  lastMinuteDeals,
  discountOffers,
  destinationGroups,
  trustedPartners,
  travelInspirations,
  generalQuestions,
  travelerTestimonials,
  serviceBenefits,
  travelStats,
  headings,
  searchIndex,
  packagesNavChildren,
  navVisibility,
  stickyHeader,
}) {
  const { phone, email, whatsapp } = useContact();
  const [planForm, setPlanForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    requirement: '',
    destination: '',
    travelDates: '',
  });

  const updatePlanField = (field) => (event) => setPlanForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handlePlanSubmit = (event) => {
    event.preventDefault();

    try {
      fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
        keepalive: true,
      });
    } catch {
      // best-effort save, don't block the WhatsApp handoff
    }

    const lines = [
      'Hi, I would like help planning my holiday.',
      planForm.firstName && `Name: ${planForm.firstName}`,
      planForm.email && `Email: ${planForm.email}`,
      planForm.phone && `Phone: ${planForm.phone}`,
      planForm.requirement && `Requirement: ${planForm.requirement}`,
      planForm.destination && `Destination: ${planForm.destination}`,
      planForm.travelDates && `Travel Dates: ${planForm.travelDates}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-shell" id="top">
      <SiteHeader searchIndex={searchIndex} packagesNavChildren={packagesNavChildren} navVisibility={navVisibility} stickyHeader={stickyHeader} />

      <HeroSlider
        slides={heroSlidesByPage?.home || []}
        fallbackTitle="All-in-one Travel Booking."
        fallbackDescription="Highlights convenience and simplicity, Best for agencies with online & mobile-friendly services."
      />

      <PopularPackages packages={popularPackages} heading={headings.popularPackages.title} subtitle={headings.popularPackages.subtitle} />
      <DiscountCarousel offers={discountOffers} heading={headings.discountOffers.title} subtitle={headings.discountOffers.subtitle} />
      <FeaturedDestinations destinationGroups={destinationGroups} heading={headings.featuredDestinations.title} />
      <ServiceBenefits benefits={serviceBenefits} heading={headings.serviceBenefits.title} />
      <TravelQuoteBanner />
      <LastMinuteDeals deals={lastMinuteDeals} heading={headings.lastMinuteDeals.title} subtitle={headings.lastMinuteDeals.subtitle} />
      <CustomTravelPackage />
      <TrustedPartners partners={trustedPartners} heading={headings.trustedPartners.title} />
      <OneDayTrips trips={oneDayTrips} heading={headings.oneDayTrips.title} subtitle={headings.oneDayTrips.subtitle} />
      <TravelInspirations inspirations={travelInspirations} heading={headings.travelInspirations.title} subtitle={headings.travelInspirations.subtitle} />
      <TravelerTestimonials testimonials={travelerTestimonials} heading={headings.travelerTestimonials.title} subtitle={headings.travelerTestimonials.subtitle} />
      <GeneralQuestions questions={generalQuestions} heading={headings.generalQuestions.title} subtitle={headings.generalQuestions.subtitle} />
      <TravelStats stats={travelStats} />

      <main>
        <section
          className="contact-section"
          id="contact"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80')" }}
        >
          <div className="contact-hero">
            <div className="contact-hero-copy">
              <h2>Plan Your Holidays With Our Assistance, Just Fill In Your Details.</h2>
              <p className="contact-hero-note">
                For feedback &amp; suggestions: <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a> / <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </div>
          <form className="contact-form" onSubmit={handlePlanSubmit}>
            <label>
              First Name <span className="required">*</span>
              <input type="text" value={planForm.firstName} onChange={updatePlanField('firstName')} required />
            </label>
            <label>
              Email Address <span className="required">*</span>
              <input type="email" value={planForm.email} onChange={updatePlanField('email')} required />
            </label>
            <label>
              Phone Number <span className="required">*</span>
              <input type="tel" value={planForm.phone} onChange={updatePlanField('phone')} required />
            </label>
            <label className="select-field">
              Requirement <span className="required">*</span>
              <select value={planForm.requirement} onChange={updatePlanField('requirement')} required>
                <option value="" disabled>Select</option>
                <option>Tour Package</option>
                <option>Visa Assistance</option>
                <option>Custom Travel Package</option>
                <option>Flight Booking</option>
                <option>Hotel Booking</option>
              </select>
            </label>
            <label className="select-field">
              Travel Destinations <span className="required">*</span>
              <select value={planForm.destination} onChange={updatePlanField('destination')} required>
                <option value="" disabled>Select</option>
                <option>Africa</option>
                <option>Asia</option>
                <option>Europe</option>
                <option>Middle East</option>
                <option>North America</option>
                <option>Oceania</option>
              </select>
            </label>
            <label className="select-field">
              Travel Dates
              <select value={planForm.travelDates} onChange={updatePlanField('travelDates')}>
                <option value="" disabled>Select</option>
                <option>Flexible</option>
                <option>Within 1 month</option>
                <option>1 - 3 months</option>
                <option>3 - 6 months</option>
                <option>6+ months</option>
              </select>
            </label>
            <button type="submit" className="button button-primary">Send Message</button>
          </form>
        </section>
      </main>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
