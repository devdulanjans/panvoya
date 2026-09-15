import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function pickRandomOffer(offers) {
  if (!offers || offers.length === 0) return null;
  return offers[Math.floor(Math.random() * offers.length)];
}

function buildOfferMessage(offer) {
  const parts = [`Hi, I'm interested in this offer: ${offer.title}.`];
  if (offer.accent || offer.discount) {
    parts.push(`${offer.accent || ''} ${offer.discount || ''}`.trim() + '.');
  }
  parts.push('Could you share more details?');
  return parts.join(' ');
}

export default function PromoOfferModal({ offers = [] }) {
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (offers.length === 0) return undefined;

    const picked = pickRandomOffer(offers);
    if (!picked) return undefined;

    const timer = setTimeout(() => {
      setOffer(picked);
      setVisible(true);
    }, 900);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  const handleViewOffer = () => {
    dismiss();
    router.push(`/contact-us?message=${encodeURIComponent(buildOfferMessage(offer))}`);
  };

  if (!visible || !offer) return null;

  return (
    <div className="promo-modal-overlay" onClick={dismiss}>
      <div className="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promo-modal-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="promo-modal-close" aria-label="Close" onClick={dismiss}>
          ×
        </button>
        <div className="promo-modal-image">
          <img src={offer.image} alt="" />
        </div>
        <div className="promo-modal-body">
          {offer.accent && <span className="promo-modal-accent">{offer.accent}</span>}
          <h2 id="promo-modal-title">{offer.discount || offer.title}</h2>
          <p>
            {offer.title}
            {offer.action && <span className="promo-modal-note"> · {offer.action}</span>}
          </p>
          <button type="button" className="promo-modal-cta" onClick={handleViewOffer}>
            Claim This Offer
          </button>
        </div>
      </div>
    </div>
  );
}
