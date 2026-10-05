import { useEffect, useRef } from 'react';
import {
  SiJavascript, SiPython, SiCplusplus, SiC,
  SiHtml5, SiCss,
  SiReact, SiTailwindcss, SiBootstrap, SiFlutter,
  SiNodedotjs, SiExpress, SiFlask,
  SiPostgresql, SiMongodb, SiSupabase,
  SiGit, SiGithub, SiDocker, SiAuth0,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import './About.css';

/* ─── Tech Stack Data ─── */
const techCategories = [
  {
    title: 'Languages',
    items: [
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'C++', icon: SiCplusplus, color: '#00599C' },
      { name: 'Java', icon: FaJava, color: '#ED8B00' },
      { name: 'C', icon: SiC, color: '#A8B9CC' },
      { name: 'HTML', icon: SiHtml5, color: '#E34F26' },
      { name: 'CSS', icon: SiCss, color: '#1572B6' },
    ],
  },
  {
    title: 'Frontend',
    items: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3' },
      { name: 'Flutter', icon: SiFlutter, color: '#02569B' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
      { name: 'Express.js', icon: SiExpress, color: '#ffffff' },
      { name: 'Flask', icon: SiFlask, color: '#ffffff' },
      { name: 'RESTful APIs', icon: null, color: '#10B981' },
    ],
  },
  {
    title: 'Databases',
    items: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'Supabase', icon: SiSupabase, color: '#3FCF8E' },
    ],
  },
  {
    title: 'Tools & Platforms',
    items: [
      { name: 'Git', icon: SiGit, color: '#F05032' },
      { name: 'GitHub', icon: SiGithub, color: '#ffffff' },
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'Auth0', icon: SiAuth0, color: '#EB5424' },
      { name: 'eSewa', icon: null, color: '#60BB46' },
    ],
  },
];

/* ─── Education Data ─── */
const educationData = [
  {
    year: '2022 - 2026',
    institution: 'National Academy of Science and Technology (NAST)',
    degree: 'B.E. in Computer Engineering',
    university: 'Pokhara University',
    description: 'Graduated with focus on full-stack web development, database systems, and software engineering principles.',
    image: '/images/nast.jpg',
  },
  {
    year: '2020 - 2022',
    institution: 'National Academy of Science and Technology (NAST)',
    degree: '+2 Science, Higher Secondary Education',
    university: null,
    description: 'Completed higher secondary education in science stream with focus on physics, chemistry, and mathematics.',
    image: '/images/nast.jpg',
  },
  {
    year: '2007 - 2020',
    institution: 'Shree J.K. Secondary School',
    degree: 'School Education (SEE)',
    university: null,
    description: 'Completed secondary education and developed foundational academic knowledge.',
    image: '/images/jk.jpg',
  },
];

/* ─── Experience Data ─── */
const experienceData = [
  {
    date: 'June 2026 - September 2026',
    role: 'MERN Stack Developer Intern',
    company: 'Sipalaya Info Tech Pvt Ltd',
    paragraphs: [
      'During my internship, I worked as a MERN Stack developer, contributing to client-facing web applications from build to delivery.',
      'I built <strong class="highlight">Everest Momo</strong>, a client-facing restaurant ordering website using React on the frontend, with Auth0 for authentication and a demo eSewa payment integration.',
      'I also worked with REST APIs and Node/Express backends alongside the team using Git/GitHub, gaining hands-on experience working with real client requirements and deadlines.',
    ],
    technologies: [
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'Express.js', icon: SiExpress, color: '#ffffff' },
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
      { name: 'Auth0', icon: SiAuth0, color: '#EB5424' },
      { name: 'eSewa', icon: null, color: '#60BB46' },
      { name: 'REST APIs', icon: null, color: '#10B981' },
      { name: 'Git', icon: SiGit, color: '#F05032' },
      { name: 'GitHub', icon: SiGithub, color: '#ffffff' },
    ],
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

/* ─── REST API Icon (custom SVG since no SI icon) ─── */
function ApiIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="6" r="1.5" fill={color} />
      <circle cx="14" cy="12" r="1.5" fill={color} />
      <circle cx="10" cy="18" r="1.5" fill={color} />
    </svg>
  );
}

/* ─── eSewa Icon (custom SVG) ─── */
function EsewaIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M7 12h10M12 9v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

/* ─── Main About Component ─── */
export default function About() {
  return (
    <section className="about" id="about">
      {/* ── ABOUT ME ── */}
      <div className="about__container">
        <Reveal>
          <span className="about__label">About Me</span>
        </Reveal>
        <Reveal delay={100}>
          <p className="about__text">
            Graduated Computer Engineering student at NAST focused on full-stack
            web development (MERN/PERN). I enjoy building products with real users
            on the other end - from a client-facing restaurant site built during my
            internship to a hyperlocal e-commerce platform for my hometown.
          </p>
        </Reveal>
      </div>

      {/* ── TECH STACK ── */}
      <div className="about__container">
        <Reveal>
          <span className="about__label">Tech Stack</span>
        </Reveal>

        <div className="tech">
          {techCategories.map((cat, catIdx) => (
            <Reveal key={cat.title} delay={catIdx * 80} className="tech__category">
              <h3 className="tech__cat-title">{cat.title}</h3>
              <div className="tech__grid">
                {cat.items.map((item) => (
                  <div key={item.name} className="tech__item" title={item.name}>
                    <span className="tech__icon" style={{ color: item.color }}>
                      {item.icon ? (
                        <item.icon size={24} />
                      ) : item.name === 'RESTful APIs' ? (
                        <ApiIcon color={item.color} />
                      ) : (
                        <EsewaIcon color={item.color} />
                      )}
                    </span>
                    <span className="tech__name">{item.name}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── EDUCATION ── */}
      <div className="about__container">
        <Reveal>
          <span className="about__label">Education</span>
        </Reveal>

        <div className="education">
          <div className="education__timeline-line" aria-hidden="true" />

          {educationData.map((edu, idx) => (
            <Reveal key={idx} delay={idx * 120} className="education__entry">
              {/* Year */}
              <div className="education__year">{edu.year}</div>

              {/* Timeline dot */}
              <div className="education__dot" aria-hidden="true" />

              {/* Content */}
              <div className="education__content">
                <div className="education__img-wrap">
                  <img
                    src={edu.image}
                    alt={edu.institution}
                    className="education__img"
                    loading="lazy"
                  />
                </div>
                <div className="education__info">
                  <h3 className="education__institution">{edu.institution}</h3>
                  <p className="education__degree">{edu.degree}</p>
                  {edu.university && (
                    <p className="education__university">{edu.university}</p>
                  )}
                  <p className="education__desc">{edu.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── EXPERIENCE ── */}
      <div className="about__container">
        <Reveal>
          <span className="about__label">Experience</span>
        </Reveal>

        <div className="education">
          <div className="education__timeline-line" aria-hidden="true" />

          {experienceData.map((exp, idx) => (
            <Reveal key={idx} delay={idx * 120} className="education__entry">
              {/* Year */}
              <div className="education__year">{exp.date}</div>

              {/* Timeline dot */}
              <div className="education__dot" aria-hidden="true" />

              {/* Content */}
              <div className="education__content">
                <div className="education__info">
                  <h3 className="education__institution">{exp.role}</h3>
                  <p className="education__degree">{exp.company}</p>
                  
                  <div className="education__desc experience__desc">
                    {exp.paragraphs.map((p, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                    ))}
                  </div>

                  <div className="experience__tech">
                    {exp.technologies.map((tech) => (
                      <div key={tech.name} className="tech__item tech__item--small" title={tech.name}>
                        <span className="tech__icon tech__icon--small" style={{ color: tech.color }}>
                          {tech.icon ? (
                            <tech.icon size={16} />
                          ) : tech.name === 'REST APIs' ? (
                            <ApiIcon color={tech.color} />
                          ) : (
                            <EsewaIcon color={tech.color} />
                          )}
                        </span>
                        <span className="tech__name tech__name--small">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
