import React, { useMemo } from 'react';
import { getAvatarUrl, getDisplayName, stripHtmlToPlainText } from '../Navbar/userMenuUtils';
import { DEFAULT_SKILLS } from './accountHubData';
import './account-hub.css';

function resolveRole(user) {
  const raw = user?.headline || user?.title || user?.role || 'Full Stack Developer';
  return stripHtmlToPlainText(raw) || 'Full Stack Developer';
}

function resolveAbout(user) {
  const bio = stripHtmlToPlainText(user?.bio || '');
  if (bio.length > 40) return bio;
  return (
    'Developer on EventThon building products across squads, gigs, and projects. ' +
    'Focused on clean UI, reliable APIs, and shipping on schedule.'
  );
}

export default function ProfileView({ userData }) {
  const name = getDisplayName(userData);
  const role = resolveRole(userData);
  const about = resolveAbout(userData);
  const avatar = getAvatarUrl(userData);

  const skills = useMemo(() => {
    const fromUser = Array.isArray(userData?.skills)
      ? userData.skills.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : [];
    return fromUser.length ? fromUser.slice(0, 8) : DEFAULT_SKILLS;
  }, [userData]);

  const jss = userData?.jss_score ?? userData?.profile_score ?? 100;
  const experienceRaw = userData?.experience_years ?? userData?.years_experience ?? 0;
  const experience = `${experienceRaw}+ Yrs`;

  return (
    <div className="account-hub">
      <h1 className="account-hub__title">Developer Profile</h1>
      <p className="account-hub__sub">Your public developer identity on EventThon.</p>

      <section className="account-hub__card">
        <div className="account-hub__banner">
          <div className="account-hub__avatar-wrap">
            <img src={avatar} alt="" />
          </div>
        </div>

        <div className="account-hub__profile-head">
          <div>
            <h2>{name}</h2>
            <p className="account-hub__role">{role}</p>
          </div>
        </div>

        <div className="account-hub__stats">
          <div className="account-hub__stat">
            <strong>{jss}%</strong>
            <span>JSS Score</span>
          </div>
          <div className="account-hub__stat">
            <strong>{experience}</strong>
            <span>Experience</span>
          </div>
          <div className="account-hub__stat">
            <strong>{userData?.rating?.toFixed?.(1) || '4.9'}</strong>
            <span>Rating</span>
          </div>
        </div>
      </section>

      <section className="account-hub__card">
        <h3 className="account-hub__section-title">About</h3>
        <p className="account-hub__about">{about}</p>
        <h3 className="account-hub__section-title" style={{ marginTop: 18 }}>
          Top Skills
        </h3>
        <div className="account-hub__skills">
          {skills.map((skill) => (
            <span key={skill} className="account-hub__skill-pill">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
