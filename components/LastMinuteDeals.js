import { useContact } from './ContactContext';

export default function LastMinuteDeals({ deals = [], heading, subtitle }) {
  const { whatsapp } = useContact();
  const displayHeading = heading || 'Last Minute Deals!';
  if (deals.length === 0) return null;

  return (
    <section className="popular-packages last-minute-deals" aria-labelledby="last-minute-heading">
      <header className="popular-packages-heading">
        <h2 id="last-minute-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="package-cards">
        {deals.map((item) => (
          <article className="package-card" key={item.id}>
            <div className={`package-image ${item.sale ? 'has-sale' : ''}`}>
              <img src={item.image} alt={`${item.title} destination`} />
              <span className="package-badge">{item.badge}</span>
              {item.sale && <span className="package-sale">Sale on!</span>}
              {item.group && <span className="package-group">Group Tour</span>}
              <div className="package-image-dots" aria-hidden="true"><i /><i /><i /></div>
            </div>
            <div className="package-card-body">
              <h3>{item.title}</h3>
              <p className="package-meta"><span>⌾ {item.location}</span><span>⌾ {item.duration}</span></p>
              <div className="package-action">
                <div className="package-action-buttons">
                  <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, Can I get more details for ${item.title}`)}`} target="_blank" rel="noreferrer">Enquire Now ↗</a>
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I'd like to make a reservation for ${item.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="package-reserve-btn"
                  >
                    Reservation
                  </a>
                </div>
                <p>{item.oldPrice && <del>{item.oldPrice}</del>}<small>per person</small><strong>{item.price}</strong></p>
              </div>
              <div className="package-features"><span>◈ Experience ⓘ</span><span>◉ Inclusion ⓘ</span></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
