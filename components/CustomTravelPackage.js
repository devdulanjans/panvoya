export default function CustomTravelPackage() {
  return (
    <section className="custom-package" aria-labelledby="custom-package-heading">
      <div className="custom-package-content">
        <h2 id="custom-package-heading">Customize Your Travel Package!</h2>
        <form className="custom-package-search">
          <span aria-hidden="true">⌾</span>
          <input type="text" aria-label="Travel location" placeholder="Select Your Location" />
          <button type="submit">Search Now</button>
        </form>
        <div className="custom-package-points">
          <span>● Make Your Favourite Package</span>
          <span>● Easily Customize Tours</span>
          <span>● Enjoy Your Trip</span>
        </div>
        <a href="#contact" className="guide-cta">
          <span>Meet Our Local Tour Guide!</span>
          <strong>Contact Now ↗</strong>
        </a>
      </div>
    </section>
  );
}
