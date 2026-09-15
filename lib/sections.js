import { z } from 'zod';

const text = (label, opts = {}) => ({ type: 'text', label, ...opts });
const textarea = (label, opts = {}) => ({ type: 'textarea', label, ...opts });
const url = (label, opts = {}) => ({ type: 'url', label, ...opts });
const link = (label, opts = {}) => ({ type: 'link', label, ...opts });
const video = (label, opts = {}) => ({ type: 'video', label, ...opts });
const boolean = (label, opts = {}) => ({ type: 'boolean', label, ...opts });
const number = (label, opts = {}) => ({ type: 'number', label, ...opts });
const select = (label, options, opts = {}) => ({ type: 'select', label, options, ...opts });

export const sections = {
  heroSlides: {
    label: 'Hero Slides',
    hasGroup: true,
    groupLabel: 'Page',
    groupOptions: ['home', 'packages', 'group-tours', 'corporate-travel', 'about-us', 'contact-us'],
    fields: {
      title: text('Title'),
      description: textarea('Description'),
      image: url('Image URL'),
      video: video('Background Video (optional — shown instead of the image if set)', { required: false }),
    },
  },
  lastMinuteDeals: {
    label: 'Last Minute Deals',
    hasGroup: false,
    fields: {
      title: text('Title'),
      location: text('Location'),
      duration: text('Duration'),
      price: text('Price'),
      oldPrice: text('Old price', { required: false }),
      image: url('Image URL'),
      badge: text('Badge'),
      sale: boolean('On sale?'),
      group: boolean('Group tour?'),
    },
  },
  discountOffers: {
    label: 'Discounts & Offers',
    hasGroup: false,
    fields: {
      title: text('Title'),
      accent: text('Accent text'),
      discount: text('Discount text'),
      action: text('Action label'),
      image: url('Image URL'),
      layoutVariant: select('Layout variant', ['family', 'bali', 'world']),
    },
  },
  featuredDestinations: {
    label: 'Featured Destinations',
    hasGroup: true,
    groupLabel: 'Category',
    fields: {
      name: text('Destination name'),
      image: url('Image URL'),
    },
  },
  trustedPartners: {
    label: 'Trusted Partners',
    hasGroup: false,
    fields: {
      name: text('Partner name'),
      detail: text('Detail', { required: false }),
    },
  },
  travelInspirations: {
    label: 'Travel Inspirations',
    hasGroup: false,
    fields: {
      title: text('Title'),
      date: text('Date (display text)'),
      image: url('Image URL'),
      location: text('Location'),
      description: textarea('Description'),
    },
  },
  generalQuestions: {
    label: 'General Questions',
    hasGroup: false,
    fields: {
      question: text('Question'),
      answer: textarea('Answer'),
    },
  },
  travelerTestimonials: {
    label: 'Traveler Testimonials',
    hasGroup: false,
    fields: {
      name: text('Name'),
      avatar: url('Avatar URL'),
      role: text('Role'),
      rating: number('Rating (1-5)', { min: 1, max: 5 }),
      reviewText: textarea('Review text'),
    },
  },
  serviceBenefits: {
    label: 'Service Benefits',
    hasGroup: false,
    fields: {
      icon: text('Icon (glyph)'),
      title: text('Title'),
      description: textarea('Description'),
      tone: select('Tone', ['gold', 'blue']),
    },
  },
  travelStats: {
    label: 'Travel Stats',
    hasGroup: false,
    fields: {
      value: text('Value (e.g. "26+")'),
      label: text('Label'),
      icon: text('Icon (glyph)'),
    },
  },
  navMenu: {
    label: 'Menu Items',
    hasGroup: false,
    fields: {
      label: text('Menu item label'),
      visible: boolean('Show on website?', { default: true }),
    },
  },
  aboutStory: {
    label: 'Our Story',
    navGroup: 'About Us',
    hasGroup: false,
    fields: {
      eyebrow: text('Eyebrow text'),
      heading: text('Heading'),
      paragraph1: textarea('Paragraph 1'),
      paragraph2: textarea('Paragraph 2'),
      image: url('Image URL'),
    },
  },
  aboutValues: {
    label: 'Mission & Values',
    navGroup: 'About Us',
    hasGroup: false,
    fields: {
      title: text('Card title'),
      description: textarea('Card description'),
    },
  },
  aboutCta: {
    label: 'Closing CTA',
    navGroup: 'About Us',
    hasGroup: false,
    fields: {
      heading: text('Heading'),
      text: textarea('Text'),
      image: url('Image URL'),
    },
  },
  contactDetails: {
    label: 'Contact Details',
    hasGroup: false,
    fields: {
      type: select('Type', ['Phone', 'WhatsApp', 'Email', 'Address']),
      label: text('Label (e.g. Head Office, Support Line)'),
      value: text('Value (number, email, or address)'),
      primary: boolean('Primary? (used site-wide)', { default: false }),
    },
  },
  socialLinks: {
    label: 'Social Media Links',
    hasGroup: false,
    fields: {
      platform: select('Platform', ['Facebook', 'Twitter/X', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Pinterest']),
      url: link('Profile URL'),
    },
  },
  siteSettings: {
    label: 'Site Settings',
    hasGroup: false,
    fields: {
      stickyHeader: boolean('Fix menu bar to top of screen while scrolling?', { default: true }),
    },
  },
};

export const sectionKeys = Object.keys(sections);

export function getSectionConfig(section) {
  const config = sections[section];
  if (!config) throw new Error(`Unknown section: ${section}`);
  return config;
}

function fieldToZod(field) {
  let schema;
  switch (field.type) {
    case 'boolean':
      schema = z.boolean();
      break;
    case 'number':
      schema = z.number();
      if (typeof field.min === 'number') schema = schema.min(field.min);
      if (typeof field.max === 'number') schema = schema.max(field.max);
      break;
    case 'select':
      schema = z.enum(field.options);
      break;
    default:
      schema = z.string();
      if (field.required !== false) schema = schema.min(1, 'Required');
  }
  if (field.type === 'boolean') return schema.optional().default(field.default ?? false);
  if (field.required === false) return schema.optional().or(z.literal(''));
  return schema;
}

export function buildPayloadSchema(section) {
  const config = getSectionConfig(section);
  const shape = {};
  Object.entries(config.fields).forEach(([name, field]) => {
    shape[name] = fieldToZod(field);
  });
  let schema = z.object(shape);
  if (config.hasGroup) {
    schema = schema.extend({ groupName: z.string().min(1, 'Category is required') });
  }
  return schema;
}

export function validatePayload(section, payload) {
  return buildPayloadSchema(section).safeParse(payload);
}

export function defaultValuesFor(section) {
  const config = getSectionConfig(section);
  const values = {};
  Object.entries(config.fields).forEach(([name, field]) => {
    values[name] = field.type === 'boolean' ? (field.default ?? false) : field.type === 'number' ? 0 : '';
  });
  if (config.hasGroup) values.groupName = '';
  return values;
}
