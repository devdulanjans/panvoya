export default function TravelStats({ stats = [] }) {
  if (stats.length === 0) return null;

  return (
    <section className="travel-stats" aria-label="Panvoya travel statistics">
      <div className="travel-stats-inner">
        {stats.map((stat) => (
          <article className="travel-stat" key={stat.id}>
            <span className="travel-stat-icon" aria-hidden="true">{stat.icon}</span>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
