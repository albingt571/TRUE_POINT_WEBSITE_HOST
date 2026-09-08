const services = [
  { num: '01', title: 'Land & boundary', desc: 'Land surveys, boundary setting and boundary refixing that establish exactly where things stand.' },
  { num: '02', title: 'Planning & CAD', desc: 'Plan drawing, CAD works and plot design prepared with precision and practical intent.' },
  { num: '03', title: 'Setting out', desc: 'Building setting out and site control to translate drawings into accurate construction.' },
  { num: '04', title: 'Levels & terrain', desc: 'Levelling, contour and topographical surveys that make the character of a site clear.' },
  { num: '05', title: 'Quantities', desc: 'Reliable quantity calculations to support informed planning, costing and delivery.' },
]

export default function Services() {
  return (
    <section id="services" className="services section-pad">
      <div className="services-heading">
        <p className="eyebrow">What we do</p>
        <h2>Every line<br />has a purpose.</h2>
        <p>From a single plot to a complex site, our work brings definition to the ground beneath your project.</p>
      </div>
      <div className="service-list">
        {services.map((s) => (
          <article key={s.num}>
            <span>{s.num}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <i>↗</i>
          </article>
        ))}
      </div>
    </section>
  )
}
