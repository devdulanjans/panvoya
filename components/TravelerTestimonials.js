export default function TravelerTestimonials({ testimonials = [], heading, subtitle }) {
  const displayHeading = heading || 'Hear It from Travelers';
  if (testimonials.length === 0) return null;

  return (
    <section className="traveler-testimonials" aria-labelledby="testimonials-heading">
      <header className="testimonials-heading">
        <h2 id="testimonials-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="testimonial-cards">
        {testimonials.map((testimonial) => (
          <article className="testimonial-card" key={testimonial.id}>
            <div className="traveler-profile">
              <div className="traveler-avatar-wrap">
                <img src={testimonial.avatar} alt="" className="traveler-avatar" />
                <span className="traveler-play" aria-hidden="true">▶</span>
              </div>
              <div>
                <h3>{testimonial.name}</h3>
                <p>{testimonial.role}</p>
              </div>
            </div>
            <div className="testimonial-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
              {'★'.repeat(testimonial.rating)}
              {'☆'.repeat(Math.max(0, 5 - testimonial.rating))}
            </div>
            <h4>Average Experience</h4>
            <p className="testimonial-review">{testimonial.reviewText}</p>
          </article>
        ))}
      </div>
      <div className="review-summary" aria-label="Review ratings">
        <div><strong>✿ Tripadvisor</strong><span>Reviews &nbsp;●●●●●</span></div>
        <b className="review-score">4.5</b>
        <div><strong>★ Trustpilot</strong><span>★★★★★ &nbsp; Reviews</span></div>
      </div>
    </section>
  );
}
