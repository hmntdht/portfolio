import { useEffect, useRef } from 'react';
import './Contact.css';

/* ─── Animated Squiggle Underline ─── */
function SquiggleUnderline() {
  return (
    <svg
      className="squiggle"
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Bottom stroke — longest, flattest arc */}
      <path
        className="squiggle__path squiggle__path--1"
        d="M 5 30 Q 80 28, 160 22 Q 240 16, 320 18 Q 360 19, 395 22"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle stroke — slightly higher arc */}
      <path
        className="squiggle__path squiggle__path--2"
        d="M 30 26 Q 100 16, 200 10 Q 280 6, 340 8 Q 370 9, 390 14"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top stroke — highest, shortest arc */}
      <path
        className="squiggle__path squiggle__path--3"
        d="M 60 22 Q 140 8, 220 4 Q 300 2, 360 6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Intersection Observer for scroll reveal ─── */
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Reusable reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Main Contact Component ─── */
export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <Reveal>
          <span className="contact__label">Contact</span>
        </Reveal>

        <Reveal delay={100}>
          <p className="contact__message">
            Have a project in mind, want to collaborate, or have an
            opportunity to work together? I&apos;d love to hear from you.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="contact__email-wrap">
            <a
              href="mailto:contacthemantchaudhary@gmail.com"
              className="contact__email"
              data-cursor-hover
            >
              contacthemantchaudhary@gmail.com
            </a>
            <SquiggleUnderline />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
