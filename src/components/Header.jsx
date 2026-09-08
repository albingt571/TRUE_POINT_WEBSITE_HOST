import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="True Point home">
        <svg viewBox="0 0 46 46" aria-hidden="true">
          <path d="M4 35 23 6l19 29H4Zm9.5-5h19L23 15.5 13.5 30Z" />
          <path d="M23 15.5V41M9 30l14 11 14-11" />
        </svg>
        <span>TRUE POINT<small>SURVEY</small></span>
      </a>
      
      <nav className={menuOpen ? "mobile-open" : ""} aria-label="Main navigation">
        <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
        <a href="#approach" onClick={() => setMenuOpen(false)}>Approach</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>

      <div className="header-actions">
        <a className="header-cta" href="#contact">Start a project <span>↗</span></a>
        <button 
          className="mobile-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
