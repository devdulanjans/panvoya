import { query, mapContentItem } from './db';
import { sectionKeys } from './sections';
import { DEFAULT_CONTACT } from './contactDefaults';

const toPlain = (item) => ({ id: item.id, ...item.data });

export async function getPublicHomepageData() {
  const [rawItems, settings] = await Promise.all([
    query('SELECT * FROM `ContentItem` ORDER BY section ASC, groupName ASC, position ASC'),
    query('SELECT * FROM `SectionSetting`'),
  ]);
  const items = rawItems.map(mapContentItem);

  const bySection = {};
  sectionKeys.forEach((key) => {
    bySection[key] = [];
  });
  items.forEach((item) => {
    if (!bySection[item.section]) bySection[item.section] = [];
    bySection[item.section].push(item);
  });

  const settingsBySection = Object.fromEntries(settings.map((s) => [s.section, s]));
  const headings = {};
  [...sectionKeys, 'popularPackages', 'oneDayTrips'].forEach((key) => {
    const setting = settingsBySection[key];
    headings[key] = { title: setting?.title || null, subtitle: setting?.subtitle || null };
  });

  const lastMinuteDeals = bySection.lastMinuteDeals.map(toPlain);

  const publicPackages = (bySection.tourPackages || [])
    .filter((item) => item.data.status === 'Public')
    .map((item) => ({
      id: item.id,
      slug: item.slug || String(item.id),
      title: item.data.title,
      shortName: item.data.shortName || item.data.title,
      category: item.data.category,
      tourArea: item.data.tourArea || '',
      tripLength: item.data.tripLength,
      duration: item.data.duration,
      image: item.data.bannerImage,
      gallery: item.data.gallery || [],
      currencies: item.data.currency || [],
      prices: item.data.priceTiers?.[0]?.prices || {},
      clickCount: item.clickCount,
    }));

  const popularPackages = publicPackages;
  const oneDayTrips = publicPackages.filter((p) => p.tripLength === 'One Day');

  const inboundNav = publicPackages
    .filter((p) => p.category === 'Inbound')
    .map((p) => ({ label: p.shortName, id: p.id, slug: p.slug, trackable: true }));

  const outboundByArea = {};
  publicPackages
    .filter((p) => p.category === 'Outbound')
    .forEach((p) => {
      const area = p.tourArea || 'Other';
      if (!outboundByArea[area]) outboundByArea[area] = [];
      outboundByArea[area].push({ label: p.shortName, id: p.id, slug: p.slug, trackable: true });
    });
  const outboundNav = Object.entries(outboundByArea).map(([area, children]) => ({ label: area, children }));

  const packagesNavChildren = [
    { label: 'Inbound', children: inboundNav },
    { label: 'Outbound', children: outboundNav },
  ];

  const destinationGroups = {};
  bySection.featuredDestinations.forEach((item) => {
    const group = item.groupName || 'Other';
    if (!destinationGroups[group]) destinationGroups[group] = [];
    destinationGroups[group].push([item.data.name, item.data.image]);
  });

  const searchIndex = [
    ...publicPackages.map((p) => ({ id: p.id, slug: p.slug, name: p.title, location: p.category, type: p.category, trackable: true })),
    ...lastMinuteDeals.map((p) => ({ name: p.title, location: p.location, type: p.badge, trackable: false })),
  ];

  const navVisibility = {};
  (bySection.navMenu || []).forEach((item) => {
    if (item.data?.label) navVisibility[item.data.label] = item.data.visible !== false;
  });

  const heroSlidesByPage = {};
  (bySection.heroSlides || []).forEach((item) => {
    const page = item.groupName || 'home';
    if (!heroSlidesByPage[page]) heroSlidesByPage[page] = [];
    heroSlidesByPage[page].push(toPlain(item));
  });

  const aboutStory = bySection.aboutStory?.[0] ? toPlain(bySection.aboutStory[0]) : null;
  const aboutCta = bySection.aboutCta?.[0] ? toPlain(bySection.aboutCta[0]) : null;
  const aboutValues = (bySection.aboutValues || []).map(toPlain);

  const popularByClicks = [...publicPackages].sort((a, b) => b.clickCount - a.clickCount);
  const quickLinks = [
    { key: 'Home', label: 'Home', href: '/' },
    { key: 'Packages', label: 'All Packages', href: '/packages' },
    { key: 'Group Tours', label: 'Group Tours', href: '/packages/group-tours' },
    { key: 'Corporate Travel', label: 'Corporate Travel', href: '/corporate-travel' },
    { key: 'About Us', label: 'About Us', href: '/about-us' },
    { key: 'Contact Us', label: 'Contact Us', href: '/contact-us' },
  ];
  const footerLinks = {
    topDestinations: publicPackages
      .filter((p) => p.category === 'Outbound')
      .slice(0, 10)
      .map((p) => ({ label: p.shortName, href: `/packages/${p.slug}` })),
    popularSearches: popularByClicks.slice(0, 10).map((p) => ({ label: p.shortName, href: `/packages/${p.slug}` })),
    resources: quickLinks
      .filter((link) => navVisibility[link.key] !== false)
      .map(({ label, href }) => ({ label, href })),
    socialLinks: (bySection.socialLinks || []).map(toPlain),
  };

  const siteSettingsRow = bySection.siteSettings?.[0] ? toPlain(bySection.siteSettings[0]) : null;
  const stickyHeader = siteSettingsRow?.stickyHeader !== false;

  const contactDetails = (bySection.contactDetails || []).map(toPlain);
  const findPrimary = (type) =>
    contactDetails.find((c) => c.type === type && c.primary) || contactDetails.find((c) => c.type === type);
  const primaryContact = {
    whatsapp: findPrimary('WhatsApp')?.value || DEFAULT_CONTACT.whatsapp,
    phone: findPrimary('Phone')?.value || DEFAULT_CONTACT.phone,
    email: findPrimary('Email')?.value || DEFAULT_CONTACT.email,
    address: findPrimary('Address')?.value || DEFAULT_CONTACT.address,
  };

  return {
    heroSlidesByPage,
    popularPackages,
    oneDayTrips,
    lastMinuteDeals,
    discountOffers: bySection.discountOffers.map(toPlain),
    destinationGroups,
    trustedPartners: bySection.trustedPartners.map(toPlain),
    travelInspirations: bySection.travelInspirations.map(toPlain),
    generalQuestions: bySection.generalQuestions.map(toPlain),
    travelerTestimonials: bySection.travelerTestimonials.map(toPlain),
    serviceBenefits: bySection.serviceBenefits.map(toPlain),
    travelStats: bySection.travelStats.map(toPlain),
    headings,
    searchIndex,
    packagesNavChildren,
    navVisibility,
    aboutStory,
    aboutCta,
    aboutValues,
    contactDetails,
    primaryContact,
    footerLinks,
    stickyHeader,
  };
}
