import { z } from 'zod';

export const CATEGORY_OPTIONS = ['Inbound', 'Outbound', 'Group Tours', 'Corporate Travel'];
export const STATUS_OPTIONS = ['Pending', 'Complete', 'Public'];
export const CURRENCY_OPTIONS = ['USD', 'LKR'];
export const CURRENCY_SYMBOLS = { USD: '$', LKR: 'Rs ' };
export const TRIP_LENGTH_OPTIONS = ['One Day', 'Multiple Days'];

const optionalString = () => z.string().optional().or(z.literal(''));

const EMPTY_RICH_TEXT_PATTERN = /^(\s|<p>|<\/p>|<br\s*\/?>)*$/i;

export function hasRichContent(html) {
  return Boolean(html) && !EMPTY_RICH_TEXT_PATTERN.test(html);
}

// Pasted content (e.g. from Word/Google Docs) often turns every space into a
// non-breaking space, which never wraps and can blow out the layout.
function sanitizeRichText(html) {
  const nonBreakingSpace = String.fromCharCode(160);
  return (html || '').split('&nbsp;').join(' ').split(nonBreakingSpace).join(' ');
}

const richTextField = () => optionalString().transform(sanitizeRichText);

const itineraryDaySchema = z.object({
  day: z.string().min(1, 'Day is required'),
  title: z.string().min(1, 'Title is required'),
  overnight: optionalString(),
  description: richTextField(),
  activities: z.array(z.string()).default([]),
  image: optionalString(),
});

const hotelSchema = z.object({
  term: optionalString(),
  hotelName: z.string().min(1, 'Hotel name is required'),
  featuredImage: optionalString(),
  gallery: z.array(z.string()).default([]),
  bookingLink: optionalString(),
  description: richTextField(),
});

const priceTierSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  pax: optionalString(),
  prices: z.record(z.string(), z.string()).default({}),
});

export const packageSchema = z
  .object({
    title: z.string().min(1, 'Tour name is required'),
    shortName: z.string().min(1, 'Short name is required'),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only')
      .optional()
      .or(z.literal('')),
    category: z.enum(CATEGORY_OPTIONS),
    tourArea: optionalString(),
    tripLength: z.enum(TRIP_LENGTH_OPTIONS),
    duration: optionalString(),
    currency: z.array(z.enum(CURRENCY_OPTIONS)).min(1, 'Select at least one currency'),
    status: z.enum(STATUS_OPTIONS),
    bannerImage: optionalString(),
    mapImage: optionalString(),
    gallery: z.array(z.string()).default([]),
    description: richTextField(),

    minHeadCount: optionalString(),
    groupPricePerHead: z.record(z.string(), z.string()).default({}),

    itinerary: z.array(itineraryDaySchema).default([]),

    hotels: z.array(hotelSchema).default([]),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    priceTiers: z.array(priceTierSchema).default([]),

    seoKeywords: optionalString(),
  })
  .refine((data) => data.category !== 'Outbound' || Boolean(data.tourArea?.trim()), {
    message: 'Tour area is required for Outbound packages',
    path: ['tourArea'],
  })
  .refine((data) => data.category !== 'Group Tours' || Boolean(data.minHeadCount?.trim()), {
    message: 'Minimum head count is required for Group Tours',
    path: ['minHeadCount'],
  })
  .refine(
    (data) => data.category !== 'Group Tours' || Object.values(data.groupPricePerHead || {}).some((price) => price?.trim()),
    {
      message: 'Price per head is required for Group Tours',
      path: ['groupPricePerHead'],
    },
  );

export function emptyPackage() {
  return {
    title: '',
    shortName: '',
    slug: '',
    category: '',
    tourArea: '',
    tripLength: '',
    duration: '',
    currency: [],
    status: 'Pending',
    bannerImage: '',
    mapImage: '',
    gallery: [],
    description: '',
    minHeadCount: '',
    groupPricePerHead: {},
    itinerary: [],
    hotels: [],
    inclusions: [],
    exclusions: [],
    priceTiers: [],
    seoKeywords: '',
  };
}

export function emptyItineraryDay() {
  return { day: '', title: '', overnight: '', description: '', activities: [], image: '' };
}

export function emptyHotel() {
  return { term: '', hotelName: '', featuredImage: '', gallery: [], bookingLink: '', description: '' };
}

export function emptyPriceTier() {
  return { type: '', pax: '', prices: {} };
}
