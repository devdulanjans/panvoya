export default function ServiceBenefits({ benefits = [], heading }) {
  const displayHeading = heading || "We're Providing Best Service Ever!";
  if (benefits.length === 0) return null;

  return (
    <section className="service-benefits" aria-labelledby="service-benefits-heading">
      <h2 id="service-benefits-heading">{displayHeading}</h2>
      <div className="service-divider" aria-hidden="true" />
      <div className="benefits-grid">
        {benefits.map((benefit) => (
          <article className="benefit-item" key={benefit.id}>
            <span className={`benefit-icon ${benefit.tone}`} aria-hidden="true">{benefit.icon}</span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
      <a href="#packages" className="service-cta">
        <span>Flat 30% Discounts All Packages</span>
        <strong>Check Offer ↗</strong>
      </a>
    </section>
  );
}
