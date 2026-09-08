import Header from './components/Header'
import HeroSlider from './components/HeroSlider'
import Intro from './components/Intro'
import Services from './components/Services'
import Approach from './components/Approach'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <div className="grain"></div>
      <Header />
      <main id="top">
        <HeroSlider />
        <Intro />
        <Services />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
