import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useFrameRenderer } from './hooks/useFrameRenderer';
import { useMagneticCursor } from './hooks/useMagneticCursor';
import Navbar from './components/Navbar';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import './App.css';

/**
 * Hand-drawn underline for the Resume button
 */
function PenUnderline() {
  return (
    <svg
      className="btn__underline"
      width="100%"
      height="12"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="pen-path"
        d="M 2 8 C 25 3, 45 10, 65 6 C 80 3, 90 8, 98 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Hero Section — the home page
 */
function HeroPage() {
  const { canvasRef, loadedRef } = useFrameRenderer();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkLoaded = () => {
      if (loadedRef.current) {
        setTimeout(() => setIsLoaded(true), 200);
      } else {
        requestAnimationFrame(checkLoaded);
      }
    };
    checkLoaded();
  }, [loadedRef]);

  return (
    <section className="hero" id="hero">
      {/* Character Canvas */}
      <canvas
        ref={canvasRef}
        className="hero__canvas"
        aria-label="Interactive character animation that follows your cursor"
      />

      {/* Loading Overlay */}
      <div className={`hero__loader ${isLoaded ? 'hero__loader--hidden' : ''}`}>
        <span className="hero__loader-text">Loading</span>
      </div>

      {/* Hero Content — Bottom Left */}
      <div className="hero__content">
        <span className="hero__greeting">Hi, I&apos;m</span>
        <h1 className="hero__name">Hemant</h1>
        <p className="hero__bio">
          Full Stack Developer crafting premium digital experiences.
          Passionate about clean code, intuitive design, and building
          products that make a difference.
        </p>

        {/* Action Buttons */}
        <div className="hero__actions">
          <a href={`${import.meta.env.BASE_URL}resume/Hemant_Chaudhary_CV.pdf`} download="Hemant_Chaudhary_CV.pdf" className="btn btn--transparent" data-cursor-hover>
            <span className="btn__text">Resume</span>
            <PenUnderline />
          </a>
          <Link to="/contact" className="btn btn--glass" data-cursor-hover>
            Let&apos;s Talk
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * About Page wrapper — adds top padding so content sits below the fixed navbar
 */
function AboutPage() {
  return (
    <div className="page page--dark">
      <About />
    </div>
  );
}

/**
 * Contact Page wrapper
 */
function ContactPage() {
  return (
    <div className="page page--dark">
      <Contact />
    </div>
  );
}

/**
 * Projects Page wrapper
 */
function ProjectsPage() {
  return (
    <div className="page page--dark">
      <Projects />
    </div>
  );
}

/**
 * Main App — routes + shared elements
 */
function App() {
  const { dotRef, auraRef } = useMagneticCursor();

  return (
    <>
      {/* Shared Navbar */}
      <Navbar />

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      {/* Custom Cursor */}
      <div ref={dotRef} className="cursor-dot" />
      <div ref={auraRef} className="cursor-aura" />
    </>
  );
}

export default App;
