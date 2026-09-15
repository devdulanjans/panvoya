import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ROTATE_MS = 4500;

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOfferMessage(offer) {
  const parts = [`Hi, I'm interested in this offer: ${offer.title}.`];
  const details = [offer.accent, offer.discount].filter((value, i, arr) => value && arr.indexOf(value) === i);
  if (details.length > 0) {
    parts.push(details.join(' — ') + '.');
  }
  parts.push('Could you share more details?');
  return parts.join(' ');
}

export default function PromoOfferModal({ offers = [] }) {
  const router = useRouter();
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (offers.length === 0) return undefined;

    const timer = setTimeout(() => {
      setOrder(shuffle(offers));
      setIndex(0);
      setVisible(true);
    }, 900);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible || order.length < 2) return undefined;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % order.length);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [visible, order.length]);

  const dismiss = () => {
    setVisible(false);
  };

  const offer = order[index];

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

          {order.length > 1 && (
            <div className="promo-modal-dots" aria-label="Other offers">
              {order.map((item, i) => (
                <button
                  key={item.id ?? i}
                  type="button"
                  className={i === index ? 'active' : ''}
                  aria-label={`Show offer ${i + 1} of ${order.length}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
