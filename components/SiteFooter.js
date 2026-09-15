import { useContact } from './ContactContext';
import { useFooterLinks } from './FooterLinksContext';

const SOCIAL_ICON = {
  Facebook: 'f',
  'Twitter/X': '𝕏',
  Instagram: '◎',
  LinkedIn: 'in',
  YouTube: '▶',
  TikTok: '♪',
  Pinterest: '◈',
};

export default function SiteFooter() {
  const { whatsapp, phone, email, address } = useContact();
  const { topDestinations, popularSearches, resources, socialLinks } = useFooterLinks();

  const footerColumns = [
    { title: 'Top Destination', links: topDestinations },
    { title: 'Popular Search', links: popularSearches },
    { title: 'Resources', links: resources },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-contact-row">
        <div className="footer-contact-intro"><span>☏</span><p><strong>To More Inquiry</strong><small>Don&apos;t hesitate Call to Panvoya.</small></p></div>
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="footer-contact"><span>●</span><p><strong>WhatsApp</strong><small>{phone}</small></p></a>
        <a href={`mailto:${email}`} className="footer-contact"><span>✉</span><p><strong>Mail Us</strong><small>{email}</small></p></a>
        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="footer-contact"><span>●</span><p><strong>Call Us</strong><small>{phone}</small></p></a>
      </div>
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/panvoya-logo.svg" alt="Panvoya logo" />
          </div>
          <p><b>Panvoya Travel Agency</b><br />{address}</p>
          {socialLinks.length > 0 && (
            <div className="footer-socials">
              {socialLinks.map((social) => (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform}>
                  {SOCIAL_ICON[social.platform] || '●'}
                </a>
              ))}
            </div>
          )}
        </div>
        {footerColumns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.length > 0
              ? column.links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)
              : <span className="footer-column-empty">Coming soon</span>}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>Copyright {new Date().getFullYear()} <b>Panvoya</b> | All Right Reserved. Design and developed by <b>Orangehill</b></p>
        <p>Accepted Payment Methods: &nbsp; <span>Mastercard</span> <span>VISA</span> <span>PayPal</span> <span>G Pay</span></p>
      </div>
    </footer>
  );
}
