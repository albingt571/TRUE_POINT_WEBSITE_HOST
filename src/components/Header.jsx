import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="True Point home">
        <img src="/logo.png" alt="True Point Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
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
