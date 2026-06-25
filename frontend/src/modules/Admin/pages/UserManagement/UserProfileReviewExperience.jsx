import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function UserProfileReviewExperience({ user }) {
  const experiences = Array.isArray(user?.experiences) ? user.experiences : [];
  const educations = Array.isArray(user?.educations) ? user.educations : [];
  const projects = Array.isArray(user?.projects) ? user.projects : [];
  const interests = user?.career_interests || {};

  const interestLabels = [
    interests.remote_opportunities ? 'Remote opportunities' : null,
    interests.full_time_jobs ? 'Full-time jobs' : null,
    interests.freelance_projects ? 'Freelance projects' : null,
    interests.internships ? 'Internships' : null,
  ].filter(Boolean);

  if (!experiences.length && !educations.length && !projects.length && !interestLabels.length) {
    return null;
  }

  return (
    <section className="upr-experience" aria-label="Professional background">
      {interestLabels.length ? (
        <div className="upr-experience__block">
          <h4 className="upr-experience__title">Career interests</h4>
          <ul className="upr-dossier__skill-list">
            {interestLabels.map((label) => (
              <li key={label} className="upr-dossier__skill-tag upr-dossier__skill-tag--muted">
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {experiences.length ? (
        <div className="upr-experience__block">
          <h4 className="upr-experience__title">
            <Briefcase size={14} aria-hidden /> Experience
          </h4>
          <ul className="upr-experience__list">
            {experiences.map((exp) => (
              <li key={exp.id || `${exp.company}-${exp.role}`} className="upr-experience__item">
                <p className="upr-experience__role">{exp.role || 'Role not specified'}</p>
                <p className="upr-experience__sub">
                  {exp.company || 'Company'} · {exp.period || exp.duration_label || 'Period not listed'}
                </p>
                {exp.desc ? <p className="upr-experience__desc">{exp.desc}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {educations.length ? (
        <div className="upr-experience__block">
          <h4 className="upr-experience__title">
            <GraduationCap size={14} aria-hidden /> Education
          </h4>
          <ul className="upr-experience__list">
            {educations.map((edu) => (
              <li key={edu.id || `${edu.institution}-${edu.degree}`} className="upr-experience__item">
                <p className="upr-experience__role">{edu.degree || 'Degree'}</p>
                <p className="upr-experience__sub">
                  {edu.institution || 'Institution'}
                  {edu.start_year || edu.end_year
                    ? ` · ${edu.start_year || '?'} – ${edu.end_year || 'Present'}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {projects.length ? (
        <div className="upr-experience__block">
          <h4 className="upr-experience__title">Projects ({projects.length})</h4>
          <ul className="upr-experience__list">
            {projects.map((project, index) => (
              <li key={project.id || `project-${index}`} className="upr-experience__item">
                <p className="upr-experience__role">{project.title || project.name || `Project ${index + 1}`}</p>
                {project.description || project.desc ? (
                  <p className="upr-experience__desc">{project.description || project.desc}</p>
                ) : null}
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="upr-experience__link">
                    View project
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
