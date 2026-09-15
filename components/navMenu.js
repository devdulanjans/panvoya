export function whatsappHref(label, whatsappNumber) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${label}`)}`;
}

export function trackPackageClick(id) {
  if (!id) return;
  try {
    fetch('/api/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
  } catch {
    // best-effort tracking, ignore failures
  }
}

export function resolveNavLink(item, whatsappNumber) {
  if (item.href) return { href: item.href, external: item.href.startsWith('http') };
  if (item.trackable && item.slug) return { href: `/packages/${item.slug}`, external: false };
  if (!item.children) return { href: whatsappHref(item.label, whatsappNumber), external: true };
  return null;
}

export const navMenu = [
  { label: 'Home', href: '/' },
  {
    label: 'Packages',
    href: '/packages',
    children: [
      {
        label: 'Inbound',
        children: [
          { label: '5N 6D Package - Down South' },
          { label: '4N 5D Package - Nuwara Eliya' },
        ],
      },
      {
        label: 'Outbound',
        children: [
          {
            label: 'Europe Tour',
            children: [
              { label: 'France' },
              { label: 'Italy' },
              { label: 'England' },
            ],
          },
          {
            label: 'West Asia',
            children: [
              { label: 'Dubai' },
              { label: 'Jordan' },
            ],
          },
        ],
      },
    ],
  },
  { label: 'Group Tours', href: '/packages/group-tours' },
  { label: 'Corporate Travel', href: '/corporate-travel' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Offers', href: '#discount-heading' },
  { label: 'Loyalty', href: '#contact' },
];
