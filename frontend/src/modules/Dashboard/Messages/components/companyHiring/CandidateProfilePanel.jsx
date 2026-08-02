import React from 'react';
import {
  FiAward,
  FiBriefcase,
  FiCheck,
  FiDownload,
  FiExternalLink,
  FiGlobe,
  FiMapPin,
  FiUsers,
} from 'react-icons/fi';
import { API_BASE_URL } from '../../../../../api/axiosConfig';

function mediaUrl(raw) {
  const u = String(raw || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  return `${base}${u.startsWith('/') ? u : `/${u}`}`;
}

function avatarFallback(name) {
  const text = encodeURIComponent((name || 'C').slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=128`;
}

function formatJoined(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 10);
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function CandidateProfilePanel({ profile = {} }) {
  const name = profile.name || 'Candidate';
  const photo = mediaUrl(profile.imageurl) || avatarFallback(name);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const gigs = Array.isArray(profile.gigs) ? profile.gigs : [];
  const resume = mediaUrl(profile.resumeUrl);
  const portfolio = mediaUrl(profile.portfolioUrl);

  return (
    <section className="chs-card chs-profile">
      <div className="chs-profile__hero">
        <div className="chs-profile__avatar-wrap">
          <img src={photo} alt="" className="chs-profile__avatar" />
          {profile.isVerified ? (
            <span className="chs-profile__verified" title="Verified">
              <FiCheck size={11} strokeWidth={3} aria-hidden />
            </span>
          ) : null}
        </div>
        <div>
          <h5>{name}</h5>
          <p>
            <FiMapPin size={12} aria-hidden /> {profile.location || '—'}
          </p>
        </div>
      </div>

      <div className="chs-profile__stats">
        <div>
          <FiAward size={13} aria-hidden />
          <strong>{profile.etRank || 'Frontline'}</strong>
          <span>ET Rank</span>
        </div>
        <div>
          <strong>Lv {profile.etLevel || '1'}</strong>
          <span>ET Level</span>
        </div>
        <div>
          <FiUsers size={13} aria-hidden />
          <strong>{profile.followers ?? 0}</strong>
          <span>Followers</span>
        </div>
      </div>

      <div className="chs-profile__block">
        <h6>Experience</h6>
        <p>{profile.experience || '—'}</p>
      </div>

      {skills.length ? (
        <div className="chs-profile__block">
          <h6>Skills</h6>
          <div className="chs-chips">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="chs-profile__actions">
        {portfolio ? (
          <a href={portfolio} target="_blank" rel="noopener noreferrer">
            <FiExternalLink size={13} aria-hidden /> Portfolio
          </a>
        ) : (
          <span className="is-muted"><FiGlobe size={13} aria-hidden /> No portfolio</span>
        )}
        {resume ? (
          <a href={resume} target="_blank" rel="noopener noreferrer">
            <FiDownload size={13} aria-hidden /> Resume
          </a>
        ) : (
          <span className="is-muted"><FiDownload size={13} aria-hidden /> No resume</span>
        )}
      </div>

      {projects.length ? (
        <div className="chs-profile__block">
          <h6>Previous Projects</h6>
          <ul>
            {projects.map((item) => (
              <li key={item}><FiBriefcase size={12} aria-hidden /> {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {gigs.length ? (
        <div className="chs-profile__block">
          <h6>Previous Gigs</h6>
          <ul>
            {gigs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="chs-profile__block">
        <h6>Languages</h6>
        <p>{languages.length ? languages.join(', ') : '—'}</p>
      </div>

      <p className="chs-profile__joined">Joined {formatJoined(profile.joinedAt)}</p>
    </section>
  );
}
