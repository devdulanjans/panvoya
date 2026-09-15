export default function TrustedPartners({ partners = [], heading }) {
  const displayHeading = heading || 'Those Company You Can Easily Trust!';
  const loopedPartners = [...partners, ...partners];

  if (partners.length === 0) return null;

  return (
    <section className="trusted-partners" aria-labelledby="trusted-partners-heading">
      <h2 id="trusted-partners-heading">{displayHeading}</h2>
      <div className="partner-logos-viewport">
        <div className="partner-logos" aria-hidden={false}>
          {loopedPartners.map((partner, index) => {
            const toneIndex = (index % partners.length) % 6;
            return (
              <div className={`partner-logo tone-${toneIndex + 1}`} key={`${partner.id}-${index}`} aria-hidden={index >= partners.length}>
                <strong>{partner.name}</strong>
                {partner.detail && <small>{partner.detail}</small>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
