import { useState, useEffect } from 'react'

const slides = [
  {
    img: '/assets/boundary-survey.png',
    alt: 'Survey engineer establishing land boundaries',
    eyebrow: 'True Point · digital land survey',
    h1: (<>Know your<br /><em>boundaries.</em></>),
    desc: 'Accurate land surveys and boundary setting for clear, confident decisions.',
    btnLabel: 'Show boundary survey slide',
    btnNum: '01',
  },
  {
    img: '/assets/setting-out.png',
    alt: 'Engineer completing building setting out',
    eyebrow: 'True Point · construction survey',
    h1: (<>Set out with<br /><em>confidence.</em></>),
    desc: 'We transfer your plans to site with accuracy from the first mark.',
    btnLabel: 'Show setting out slide',
    btnNum: '02',
  },
  {
    img: '/assets/topographic-survey.png',
    alt: 'Engineer undertaking a topographical survey',
    eyebrow: 'True Point · terrain data',
    h1: (<>See every<br /><em>contour.</em></>),
    desc: 'Topographical surveys that turn terrain into useful project data.',
    btnLabel: 'Show topographical survey slide',
    btnNum: '03',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  function showSlide(index) {
    setCurrent(index)
  }

  return (
    <section className="hero service-slider" aria-label="True Point surveying services">
      {slides.map((slide, index) => (
        <article key={index} className={`slide${index === current ? ' active' : ''}`}>
          <img src={slide.img} alt={slide.alt} />
          <div className="slide-shade"></div>
          <div className="hero-grid"></div>
          <div className="slide-content">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h1>{slide.h1}</h1>
            <p>{slide.desc}</p>
          </div>
        </article>
      ))}
      <div className="slider-controls">
        {slides.map((slide, index) => (
          <button
            key={index}
            type="button"
            data-slide={index}
            className={index === current ? 'active' : ''}
            aria-label={slide.btnLabel}
            onClick={() => showSlide(index)}
          >
            {slide.btnNum}
          </button>
        ))}
        <a href="#services">Explore services <span>↓</span></a>
      </div>
    </section>
  )
}
