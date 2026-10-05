import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

/**
 * Shared navigation component used across all pages.
 * Includes the logo (top-left) and the frosted-glass nav pill.
 */
export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      {/* Logo - Top Left */}
      <Link to="/" className={`site-logo ${isHome ? '' : 'site-logo--dark'}`} data-cursor-hover>
        Hemant Chaudhary
      </Link>

      {/* Navigation — Frosted Glass Pill */}
      <nav className={`site-nav ${isHome ? '' : 'site-nav--dark'}`} aria-label="Main navigation">
        <Link to="/" className="site-nav__link" data-cursor-hover>
          Home
        </Link>
        <Link to="/about" className="site-nav__link" data-cursor-hover>
          About
        </Link>
        <Link to="/projects" className="site-nav__link" data-cursor-hover>
          Projects
        </Link>
        <Link to="/contact" className="site-nav__link" data-cursor-hover>
          Contact
        </Link>
      </nav>
    </>
  );
}
