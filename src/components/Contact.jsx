export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-grid"></div>
      <div className="contact-inner">
        <p className="eyebrow">Let's get to ground truth</p>
        <h2>Need survey<br /><em>services?</em></h2>
        <p className="contact-copy">Tell us about your land, building or planning requirement. We'll help you define the next step.</p>
        <a className="contact-button" href="mailto:hello@yourcompany.com">
          Request a consultation <span>↗</span>
        </a>
        <div className="contact-details">
          <a href="tel:+910000000000">
            <small>CALL US</small>
            <strong>+91 00000 00000</strong>
          </a>
          <a href="mailto:hello@yourcompany.com">
            <small>EMAIL US</small>
            <strong>hello@yourcompany.com</strong>
          </a>
          <a href="https://maps.google.com/?q=Your+Office+Location" target="_blank" rel="noreferrer">
            <small>VISIT US</small>
            <strong>Your office location, India ↗</strong>
          </a>
        </div>
        <p className="contact-note">Replace the sample contact details with your business phone, email and address.</p>
      </div>
    </section>
  )
}
