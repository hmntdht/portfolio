import { useEffect, useRef } from 'react';
import {
  SiPostgresql, SiExpress, SiReact, SiNodedotjs,
  SiAuth0, SiHtml5, SiCss, SiBootstrap, SiFlask,
} from 'react-icons/si';
import './Projects.css';

/* ─── Project Data ─── */
const projects = [
  {
    num: '01',
    title: 'Smart Nepal Buy',
    description:
      'A hyperlocal e-commerce and delivery platform built to connect customers with local shops and provide a faster local shopping experience in Dhangadhi.',
    stack: 'PERN Stack',
    technologies: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
      { name: 'Express.js', icon: SiExpress, color: '#ffffff' },
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
    ],
    liveUrl: 'https://smart-nepal-buy-two.vercel.app/',
    githubUrl: 'https://github.com/hmntdht/SmartNepalBuy',
    context: null,
  },
  {
    num: '02',
    title: 'Keegle Exercise',
    description:
      'A web and Android exercise application built with real-time synchronization across platforms.',
    stack: 'Web + Android',
    technologies: [],
    liveUrl: 'https://kegle.vercel.app/',
    githubUrl: 'https://github.com/hmntdht/kegle_exercise',
    context: null,
    stackNote: 'Real-time Synchronization',
  },
  {
    num: '03',
    title: 'Everest Momo',
    description:
      'A client-facing restaurant ordering website built with React, featuring Auth0 authentication and demo eSewa payment integration.',
    stack: 'MERN Stack',
    technologies: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Auth0', icon: SiAuth0, color: '#EB5424' },
    ],
    liveUrl: 'https://momo-five-woad.vercel.app/',
    githubUrl: 'https://github.com/hmntdht/momo',
    context: 'Built during internship at Sipalaya Info Tech',
  },
  {
    num: '04',
    title: 'NAST Eat',
    description:
      'A web-based cafeteria management and food ordering system with menu browsing, order history, and inventory management.',
    stack: 'Flask + Bootstrap',
    technologies: [
      { name: 'HTML', icon: SiHtml5, color: '#E34F26' },
      { name: 'CSS', icon: SiCss, color: '#1572B6' },
      { name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3' },
      { name: 'Flask', icon: SiFlask, color: '#ffffff' },
    ],
    liveUrl: 'https://nasteat.pythonanywhere.com/',
    githubUrl: 'https://github.com/hmntdht/CafeteriaManagementSystem',
    context: null,
  },
];

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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Animated Squiggle Underline ─── */
function SquiggleUnderline() {
  return (
    <svg
      className="project-squiggle"
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="project-squiggle__path project-squiggle__path--1"
        d="M 5 30 Q 80 28, 160 22 Q 240 16, 320 18 Q 360 19, 395 22"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="project-squiggle__path project-squiggle__path--2"
        d="M 30 26 Q 100 16, 200 10 Q 280 6, 340 8 Q 370 9, 390 14"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="project-squiggle__path project-squiggle__path--3"
        d="M 60 22 Q 140 8, 220 4 Q 300 2, 360 6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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



/* ─── Single Project Entry ─── */
function ProjectEntry({ project, index }) {
  return (
    <Reveal delay={index * 80}>
      <article className="project">
        {/* Divider line */}
        <div className="project__divider" />

        {/* Header row: Number + Title + Links */}
        <div className="project__header">
          <span className="project__num">{project.num}</span>
          <div className="project__title-area">
            <h3 className="project__title">{project.title}</h3>
            {project.context && (
              <span className="project__context">{project.context}</span>
            )}
          </div>
          <div className="project__links">
            <div className="project-link-wrap">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
                data-cursor-hover
              >
                Live Demo
              </a>
              <SquiggleUnderline />
            </div>
            <div className="project-link-wrap">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
                data-cursor-hover
              >
                GitHub
              </a>
              <SquiggleUnderline />
            </div>
          </div>
        </div>

        {/* Body: Description + Meta */}
        <div className="project__body">
          <p className="project__desc">{project.description}</p>

          <div className="project__meta">
            {/* Stack label */}
            <div className="project__stack">
              <span className="project__stack-label">{project.stack}</span>
              {project.stackNote && (
                <span className="project__stack-note">{project.stackNote}</span>
              )}
            </div>

            {/* Technology icons */}
            {project.technologies.length > 0 && (
              <div className="project__tech">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.name}
                    className="project__tech-tag"
                    title={tech.name}
                  >
                    <tech.icon size={14} style={{ color: tech.color }} />
                    <span>{tech.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ─── Main Projects Component ─── */
export default function Projects() {
  return (
    <section className="projects" id="projects">
      <div className="projects__container">
        {/* Section Header */}
        <Reveal>
          <span className="projects__label">Projects</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="projects__subtitle">
            A selection of projects I&apos;ve built across full-stack development,
            real-world client work, and product-focused applications.
          </p>
        </Reveal>

        {/* Project List */}
        <div className="projects__list">
          {projects.map((project, idx) => (
            <ProjectEntry key={project.num} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
