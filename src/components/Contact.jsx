import MapRoute from './MapRoute';

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-grid"></div>
      <div className="contact-inner">
        <p className="eyebrow">Let's get to ground truth</p>
        <h2>Need survey<br /><em>services?</em></h2>
        <p className="contact-copy">Tell us about your land, building or planning requirement. We'll help you define the next step.</p>
        <a className="contact-button" href="https://wa.me/917593967016?text=Hi%2C%20I%20would%20like%20to%20get%20a%20consultation%20regarding%20survey%20services." target="_blank" rel="noreferrer">
          Get Consultation via WhatsApp <span>↗</span>
        </a>
        <div className="contact-details">
          <a href="tel:+917593967016">
            <small>CALL US</small>
            <strong>+91 7593967016</strong>
          </a>
          <a href="tel:+919645431016">
            <small>CALL US</small>
            <strong>+91 9645431016</strong>
          </a>
          <a href="mailto:truepoint571@gmail.com">
            <small>EMAIL US</small>
            <strong>truepoint571@gmail.com</strong>
          </a>
          <a href="mailto:thaiparambilthomas@gmail.com">
            <small>EMAIL US</small>
            <strong>thaiparambilthomas@gmail.com</strong>
          </a>
          <a href="https://maps.google.com/?q=VMWJ%2BQ6+Peravoor,+Kerala" target="_blank" rel="noreferrer">
            <small>VISIT US</small>
            <strong>Peravoor, Kannur, Kerala ↗</strong>
          </a>
        </div>

        <MapRoute />
      </div>
    </section>
  )
}
