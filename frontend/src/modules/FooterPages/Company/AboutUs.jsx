import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import TeamMemberFluidPortrait from '../components/TeamMemberFluidPortrait';
import useCompanyFooterContent from '../hooks/useCompanyFooterContent';
import { TEAM, TIMELINE } from '../data/aboutData';
import { teamAccentFromIndex } from '../utils/aboutCmsUtils';
import { resolveMediaUrl } from '../../../components/shared/utils/resolveMediaUrl';
import '../styles/about-us.css';

const FEATURED_TEAM_COUNT = 2;

function TeamMemberCard({ member }) {
  const src = member.avatarUrl ? resolveMediaUrl(member.avatarUrl) : '';

  return (
    <article className="about-page__team-card">
      <TeamMemberFluidPortrait
        imageSrc={src}
        alt={member.name}
        fallback={(
          <div className="about-page__team-fallback team-fluid-portrait__fallback" style={{ background: member.accent }}>
            {member.initials}
          </div>
        )}
      />
      <div className="about-page__team-meta-block">
        <strong>{member.name}</strong>
        <span>{member.role}</span>
        {member.bio ? <p className="about-page__team-bio">{member.bio}</p> : null}
      </div>
    </article>
  );
}

export default function AboutUs() {
  const { data } = useCompanyFooterContent('About Us');
  const page = data || {
    subtitle: 'The story behind EventThon and the team building the elite creator network.',
    bodyParagraphs: [],
    timeline: TIMELINE,
    team: TEAM.map((member, index) => ({
      ...member,
      bio: '',
      avatarUrl: '',
      accent: teamAccentFromIndex(index),
    })),
    coverImage: '',
  };
  const featuredTeam = page.team.slice(0, FEATURED_TEAM_COUNT);
  const moreTeam = page.team.slice(FEATURED_TEAM_COUNT);

  return (
    <FooterPageShell variant="company">
      <PageHero title="About Us" subtitle={page.subtitle} />

      {page.coverImage ? (
        <section className="about-page__hero fp-card">
          <img
            className="about-page__hero-cover"
            src={resolveMediaUrl(page.coverImage)}
            alt="About EventThon"
          />
        </section>
      ) : null}

      {page.bodyParagraphs.length ? (
        <section className="fp-card about-page__story">
          <h2 className="fp-section-title">Our story</h2>
          {page.bodyParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {page.timeline.length ? (
        <section className="fp-card about-page__journey">
          <h2 className="fp-section-title">Our journey</h2>
          <ol className="about-page__timeline">
            {page.timeline.map((step) => (
              <li key={`${step.year}-${step.title}`} className="about-page__timeline-item">
                <span className="about-page__timeline-year">{step.year}</span>
                <div className="about-page__timeline-body">
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {page.team.length ? (
        <section className="fp-card about-page__team-section">
          <h2 className="fp-section-title">Leadership team</h2>
          <p className="about-page__team-hint">Hover a portrait to see colorful smoke rise from the photo.</p>
          {featuredTeam.length ? (
            <div className="about-page__team-grid about-page__team-grid--featured">
              {featuredTeam.map((member) => (
                <TeamMemberCard key={member.name} member={member} />
              ))}
            </div>
          ) : null}
          {moreTeam.length ? (
            <div className="about-page__team-more">
              <h3 className="about-page__team-more-title">More team members</h3>
              <div className="about-page__team-grid about-page__team-grid--more">
                {moreTeam.map((member) => (
                  <TeamMemberCard key={member.name} member={member} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </FooterPageShell>
  );
}
