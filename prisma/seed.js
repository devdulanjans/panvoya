require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { slugify } = require('../lib/slug.js');

const prisma = new PrismaClient();

const heroSlidesByPage = {
  home: [
    {
      title: "Explore Sri Lanka's coastlines",
      description: 'Beach escapes, luxury resorts, and sunrise shorelines.',
      image: 'https://www.srilankatourismalliance.com/wp-content/uploads/2020/07/home-banner-frame-1_531b0a49e14ce11ce2833cb243642c1b.jpg',
    },
    {
      title: 'Discover cultural journeys',
      description: 'Ancient temples, heritage towns, and local traditions.',
      image: 'https://resortglenmyu.com/wp-content/uploads/2024/01/4.jpg',
    },
    {
      title: 'Adventure beyond the horizon',
      description: 'Wildlife safaris, hill country escapes, and scenic adventures.',
      image: 'https://www.andbeyond.com/wp-content/uploads/sites/5/Seema-Malaka-Temple-colombo-sri-lanka.jpg',
    },
  ],
  packages: [
    {
      title: 'All Travel Packages',
      description: 'Browse every tour package we currently offer.',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    },
  ],
  'group-tours': [
    {
      title: 'Group Tours',
      description: 'Travel packages designed for groups, priced per head.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1600&q=85',
    },
  ],
  'corporate-travel': [
    {
      title: 'Corporate Travel',
      description: 'Travel packages tailored for corporate and business trips.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    },
  ],
  'about-us': [
    {
      title: 'About Panvoya',
      description: 'Your trusted travel partner for unforgettable journeys across Sri Lanka and beyond.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80',
    },
  ],
  'contact-us': [
    {
      title: 'Contact Us',
      description: "We're here to help plan your next journey — reach out any way that suits you.",
      image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=80',
    },
  ],
};

const contactDetails = [
  { type: 'WhatsApp', label: 'Primary WhatsApp', value: '94345533865', primary: true },
  { type: 'Phone', label: 'Main Office', value: '+94 345 533 865', primary: true },
  { type: 'Email', label: 'General Inquiries', value: 'info@panvoya.com', primary: true },
  { type: 'Address', label: 'Head Office', value: 'Colombo, Sri Lanka', primary: true },
];

const socialLinks = [
  { platform: 'Facebook', url: 'https://facebook.com/panvoyatravel' },
  { platform: 'Twitter/X', url: 'https://x.com/panvoyatravel' },
  { platform: 'YouTube', url: 'https://youtube.com/@panvoyatravel' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/company/panvoyatravel' },
];

const siteSettings = [{ stickyHeader: true }];

const tourPackages = [
  { title: 'Old Town Discovery Walk', shortName: 'Old Town Walk', category: 'Inbound', tourArea: '', tripLength: 'Multiple Days', duration: '02/Hours', currency: ['USD', 'LKR'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'A guided walk through Qatar’s historic old town.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '69.00', LKR: '22000.00' } }], seoKeywords: '' },
  { title: 'Rome, Florence & Venice', shortName: 'Italy Highlights', category: 'Outbound', tourArea: 'Europe Tour', tripLength: 'Multiple Days', duration: '5 Days/6 Nights', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'A classic tour across Italy’s most iconic cities.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '70.00' } }], seoKeywords: '' },
  { title: 'The French Alps Adventure', shortName: 'French Alps', category: 'Outbound', tourArea: 'Europe Tour', tripLength: 'Multiple Days', duration: '8 Days/7 Nights', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'An adventure tour through the French Alps.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '580.00' } }], seoKeywords: '' },
  { title: 'Kiwi Adventures Await', shortName: 'New Zealand', category: 'Outbound', tourArea: 'Oceania Tour', tripLength: 'Multiple Days', duration: '5 Days/4 Nights', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'Explore New Zealand’s most thrilling adventure spots.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '449.00' } }], seoKeywords: '' },
  { title: 'Bali Paradise Tour', shortName: 'Bali', category: 'Outbound', tourArea: 'Southeast Asia', tripLength: 'Multiple Days', duration: '5 Days/6 Nights', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'Relax on the beaches and temples of Bali.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '499.00' } }], seoKeywords: '' },
  { title: 'Culture & Cuisine Discovery', shortName: 'Culture & Cuisine', category: 'Inbound', tourArea: '', tripLength: 'Multiple Days', duration: '02/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=85', mapImage: '', gallery: [], description: 'A culinary and cultural discovery tour.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '65.00' } }], seoKeywords: '' },
  { title: 'Art, Music & Heritage Tour', shortName: 'Art & Heritage', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '03/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'A one-day tour of art, music, and heritage sites.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '69.00' } }], seoKeywords: '' },
  { title: 'Eco-Friendly City Ride', shortName: 'City Ride', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '05/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'An eco-friendly city ride exploring the sights.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '120.00' } }], seoKeywords: '' },
  { title: 'Mystic Mountains Retreat', shortName: 'Mountains Retreat', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '01/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'A short retreat into the mystic mountains.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '65.00' } }], seoKeywords: '' },
  { title: 'Coastal Sunrise Escape', shortName: 'Sunrise Escape', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '04/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'A sunrise escape along the coast.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '85.00' } }], seoKeywords: '' },
  { title: 'Historic Old Town Walk', shortName: 'Old Town Rome', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '03/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'A walking tour through the historic old town.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '95.00' } }], seoKeywords: '' },
  { title: 'Rainforest Discovery', shortName: 'Rainforest', category: 'Inbound', tourArea: '', tripLength: 'One Day', duration: '06/Hours', currency: ['USD'], status: 'Public', bannerImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85', mapImage: '', gallery: [], description: 'A rainforest discovery day trip.', itinerary: [], hotels: [], inclusions: [], exclusions: [], priceTiers: [{ type: 'Standard', pax: '', prices: { USD: '110.00' } }], seoKeywords: '' },
];

const lastMinuteDeals = [
  { title: 'A Magical City Adventure', location: 'Jamaica, Kenya', duration: '2 Days/1 Nights', price: '$444.00', oldPrice: '$599.00', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=85', badge: 'Featured', sale: true, group: true },
  { title: 'Art, Music & Heritage Tour', location: 'Arab Emirates', duration: '03/Hours', price: '$69.00', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85', badge: 'Family Tour', sale: false, group: false },
  { title: 'Bali Paradise Tour', location: 'Senegal, Zimbabwe', duration: '5 Days/6 Nights', price: '$499.00', oldPrice: '$599.00', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85', badge: 'Solo Tour', sale: true, group: false },
  { title: 'Culture & Cuisine Discovery', location: 'Saudi Arabia', duration: '02/Hours', price: '$65.00', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=85', badge: 'Solo Tour', sale: false, group: false },
  { title: 'Cycling The Loire', location: 'Ghana', duration: '2 Days/1 Nights', price: '$699.00', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=700&q=85', badge: 'Group Tour', sale: true, group: false },
  { title: 'Eco-Friendly City Ride', location: 'Tokyo, Japan', duration: '05/Hours', price: '$120.00', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=85', badge: 'Featured', sale: false, group: false },
];

const discountOffers = [
  { title: 'Family Travel Tour', accent: 'SAVE', discount: 'UP TO 40% OFF', action: 'Apply Now', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'family' },
  { title: 'Bali, Indonesia', accent: 'Total Price', discount: '$299.00', action: 'Per Person Only', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'bali' },
  { title: 'Travel Around The World', accent: 'TRAVEL', discount: '30% OFF', action: 'View All Tour', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'world' },
  { title: 'Maldives Escape', accent: 'SAVE', discount: '25% OFF', action: 'Book Today', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'family' },
  { title: 'Japan Discovery', accent: 'Total Price', discount: '$899.00', action: 'Per Person Only', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'bali' },
  { title: 'European Highlights', accent: 'TRAVEL', discount: '20% OFF', action: 'View All Tour', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=85', layoutVariant: 'world' },
];

const featuredDestinations = {
  Africa: [
    ['Morocco', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=700&q=85'],
    ['South Africa', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=85'],
    ['Madagascar', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=85'],
    ['Kenya', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=85'],
    ['Egypt', 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=700&q=85'],
    ['Tanzania', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=85'],
    ['Namibia', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=700&q=85'],
    ['Zanzibar', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=700&q=85'],
    ['Seychelles', 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=700&q=85'],
  ],
  Asia: [
    ['Bali', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85'],
    ['Japan', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=85'],
    ['Thailand', 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=85'],
    ['Maldives', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=700&q=85'],
  ],
  Europe: [
    ['Paris', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=85'],
    ['Rome', 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=700&q=85'],
    ['Santorini', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=85'],
    ['Swiss Alps', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=700&q=85'],
  ],
  'Middle East': [
    ['Dubai', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=85'],
    ['Petra', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=85'],
    ['Doha', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=85'],
    ['Oman', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=700&q=85'],
  ],
  'North America': [
    ['New York', 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=700&q=85'],
    ['Canada', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=700&q=85'],
    ['Mexico', 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=700&q=85'],
    ['Hawaii', 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?auto=format&fit=crop&w=700&q=85'],
  ],
  Oceania: [
    ['Sydney', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=700&q=85'],
    ['New Zealand', 'https://images.unsplash.com/photo-1469521669194-b19e9c7e8f1a?auto=format&fit=crop&w=700&q=85'],
    ['Fiji', 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=700&q=85'],
    ['Melbourne', 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=700&q=85'],
  ],
};

const trustedPartners = [
  { name: 'travel', detail: 'universe' },
  { name: 'G-Fly', detail: 'Global Agency' },
  { name: 'TRAVERSE', detail: '' },
  { name: 'TripZo!', detail: 'Traveler.co' },
  { name: 'Borcelle', detail: 'Tour & Travel' },
  { name: 'GoFLY', detail: 'Travel.co' },
];

const sharedInspirationLocation = 'Rome , Italy';
const sharedInspirationDescription = "Escape to the World's Most Breathtaking Islands and immerse yourself in paradise.";

const travelInspirations = [
  { title: 'Tropical Escapes & Beach Getaways.', date: '12 Sep, 2025', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85', location: sharedInspirationLocation, description: sharedInspirationDescription },
  { title: 'Crystal-Clear Waters & White Sands.', date: '12 Sep, 2025', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85', location: sharedInspirationLocation, description: sharedInspirationDescription },
  { title: 'Mountain Trails & Hidden Wonders.', date: '24 Oct, 2025', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85', location: sharedInspirationLocation, description: sharedInspirationDescription },
  { title: 'Culture, Food & Unforgettable Stories.', date: '04 Nov, 2025', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=85', location: sharedInspirationLocation, description: sharedInspirationDescription },
];

const generalQuestions = [
  { question: 'What Services Does Your Travel Agency Provide?', answer: 'A travel agency typically provides a wide range of services to ensure a smooth and enjoyable travel experience. As like- Hotel booking, Flight Booking, Visa & Customized Travel Packcge etc.' },
  { question: 'Do You Offer Customized Travel Packages?', answer: 'Yes, we create flexible travel packages around your preferred destination, dates, activities, and budget.' },
  { question: 'How do I book a tour or vacation package?', answer: 'Choose a package and contact our travel team. We will confirm availability, personalize the itinerary, and guide you through booking.' },
  { question: 'Do You Provide Visa Assistance?', answer: 'Our team can help you prepare the required documents and guide you through the visa application process.' },
  { question: 'Do you provide travel insurance options?', answer: 'Yes, travel insurance options can be included with your package to help protect your journey.' },
];

const sharedReviewText = 'The tour was well-organized, and we enjoyed every bit of it. However, I wish we had more free time to explore on our own. Overall, a great experience!';

const travelerTestimonials = [
  { name: 'Robert Kcarery', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', role: 'GoFly Traveler', rating: 5, reviewText: sharedReviewText },
  { name: 'Selina Henry', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', role: 'GoFly Traveler', rating: 5, reviewText: sharedReviewText },
  { name: 'James Bonde', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', role: 'GoFly Traveler', rating: 5, reviewText: sharedReviewText },
];

const serviceBenefits = [
  { icon: '✪', title: 'Local Guidance', description: 'Travel agencies have experienced professionals guidance.', tone: 'gold' },
  { icon: '%', title: 'Deals & Discounts', description: 'Agencies have special discounts on flights, hotels, & packages.', tone: 'blue' },
  { icon: '▣', title: 'Saves Money', description: 'Avoids hidden fees & tourist traps, Multi-destination & budget-friendly options.', tone: 'gold' },
];

const travelStats = [
  { value: '26+', label: 'Tour Completed', icon: '◉' },
  { value: '12+', label: 'Travel Experience', icon: '♟' },
  { value: '20+', label: 'Happy Traveler', icon: '⌁' },
  { value: '98%', label: 'Retention Rate', icon: '♙' },
];

const navMenuItems = [
  { label: 'Home', visible: true },
  { label: 'Packages', visible: true },
  { label: 'Group Tours', visible: true },
  { label: 'Corporate Travel', visible: true },
  { label: 'About Us', visible: true },
  { label: 'Contact Us', visible: true },
  { label: 'Offers', visible: true },
  { label: 'Loyalty', visible: true },
];

const aboutStory = [
  {
    eyebrow: 'Our Story',
    heading: 'Built on a Passion for Travel',
    paragraph1:
      "Panvoya was founded with a simple goal: to make travel planning effortless, personal, and memorable. From day trips along Sri Lanka's coastline to international getaways and group tours, our team works closely with every traveler to design journeys that fit their story.",
    paragraph2:
      'What started as a small team of travel enthusiasts has grown into a full-service agency handling everything from flights and accommodation to visas and corporate travel — always with the same attention to detail we started with.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
  },
];

const aboutValues = [
  { title: 'Our Mission', description: 'To connect travelers with experiences that inspire, relax, and create lasting memories.' },
  { title: 'Our Vision', description: "To be Sri Lanka's most trusted travel partner for both leisure and corporate journeys." },
  { title: 'Customer First', description: 'Every itinerary is built around what matters most to you — your time, your budget, and your interests.' },
  { title: 'Local Expertise', description: "Our team's deep knowledge of local destinations means better recommendations and smoother trips." },
];

const aboutCta = [
  {
    heading: 'Ready to Start Planning Your Next Trip?',
    text: 'Tell us where you want to go, and our team will take care of the rest — from the first idea to the final itinerary.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
];

const sectionSettings = [
  { section: 'heroSlides', title: null, subtitle: null },
  { section: 'popularPackages', title: 'Popular Travel Packages', subtitle: 'A curated list of the most popular travel packages based on different destinations.' },
  { section: 'oneDayTrips', title: 'One Day Trips', subtitle: 'A curated list of the most popular travel packages based on different destinations.' },
  { section: 'lastMinuteDeals', title: 'Last Minute Deals!', subtitle: 'A curated list of the most popular travel packages based on different destinations.' },
  { section: 'discountOffers', title: 'Discounts & Offers', subtitle: 'A curated list of the most popular travel packages based on different destinations.' },
  { section: 'featuredDestinations', title: 'Featured Destinations', subtitle: null },
  { section: 'trustedPartners', title: 'Those Company You Can Easily Trust!', subtitle: null },
  { section: 'travelInspirations', title: 'Travel Inspirations', subtitle: "A curated list of inspiration the most tour & travel based on different destinations." },
  { section: 'generalQuestions', title: 'General Questions', subtitle: "We're committed to offering more than just products—we provide exceptional experiences." },
  { section: 'travelerTestimonials', title: 'Hear It from Travelers', subtitle: 'We go beyond just booking trips—we create unforgettable travel experiences that match your dreams!' },
  { section: 'serviceBenefits', title: "We're Providing Best Service Ever!", subtitle: null },
  { section: 'travelStats', title: null, subtitle: null },
  { section: 'aboutValues', title: 'Our Mission & Values', subtitle: 'The principles that guide every itinerary we build and every trip we help plan.' },
  { section: 'contactDetails', title: 'Contact Details', subtitle: 'Reach us through whichever channel is most convenient for you.' },
];

async function seedFlatSection(section, items) {
  const usedSlugs = new Set();
  for (let i = 0; i < items.length; i += 1) {
    let slug;
    if (section === 'tourPackages') {
      const base = slugify(items[i].title) || 'package';
      slug = base;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
      }
      usedSlugs.add(slug);
    }
    await prisma.contentItem.create({
      data: { section, position: i, slug, data: { ...items[i], slug } },
    });
  }
}

async function seedGroupedSection(section, groups) {
  let position = 0;
  const entries = Object.entries(groups);
  for (const [groupName, items] of entries) {
    for (const [name, image] of items) {
      await prisma.contentItem.create({
        data: { section, groupName, position, data: { name, image } },
      });
      position += 1;
    }
  }
}

async function seedGroupedItemsSection(section, groups) {
  let position = 0;
  for (const [groupName, items] of Object.entries(groups)) {
    for (const data of items) {
      await prisma.contentItem.create({ data: { section, groupName, position, data } });
      position += 1;
    }
  }
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin';

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, name: adminName, role: 'ADMIN', active: true },
    create: { name: adminName, email: adminEmail, password: hashedPassword, role: 'ADMIN' },
  });

  await prisma.contentChange.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.sectionSetting.deleteMany();

  await seedGroupedItemsSection('heroSlides', heroSlidesByPage);
  await seedFlatSection('tourPackages', tourPackages);
  await seedFlatSection('lastMinuteDeals', lastMinuteDeals);
  await seedFlatSection('discountOffers', discountOffers);
  await seedGroupedSection('featuredDestinations', featuredDestinations);
  await seedFlatSection('trustedPartners', trustedPartners);
  await seedFlatSection('travelInspirations', travelInspirations);
  await seedFlatSection('generalQuestions', generalQuestions);
  await seedFlatSection('travelerTestimonials', travelerTestimonials);
  await seedFlatSection('serviceBenefits', serviceBenefits);
  await seedFlatSection('travelStats', travelStats);
  await seedFlatSection('navMenu', navMenuItems);
  await seedFlatSection('aboutStory', aboutStory);
  await seedFlatSection('aboutValues', aboutValues);
  await seedFlatSection('aboutCta', aboutCta);
  await seedFlatSection('contactDetails', contactDetails);
  await seedFlatSection('socialLinks', socialLinks);
  await seedFlatSection('siteSettings', siteSettings);

  await prisma.sectionSetting.createMany({ data: sectionSettings });

  console.log(`Seed complete. Admin login: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
