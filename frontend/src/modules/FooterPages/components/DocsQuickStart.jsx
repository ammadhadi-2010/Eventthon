import React from 'react';
import { Link } from 'react-router-dom';
import { FiInfo, FiCheckCircle } from 'react-icons/fi';
import {
  DOC_ACCOUNT_STEPS,
  DOC_FEATURES,
  DOC_PROFILE_CHECKS,
  DOC_UPDATED,
} from '../data/documentationData';
import CodeSnippetBox from './CodeSnippetBox';

export function DocsTopicArticle({ page }) {
  if (!page) return null;
  const updated = page.updated || DOC_UPDATED;

  return (
    <article className="docs-article">
      <h1 className="docs-article__title">{page.title}</h1>
      {page.intro ? <p className="docs-article__intro">{page.intro}</p> : null}
      <p className="docs-article__meta">Last updated: {updated}</p>
      {page.body ? <p className="docs-article__body">{page.body}</p> : null}
      {page.code ? <CodeSnippetBox code={page.code} title={page.title} /> : null}
      <div className="docs-article__actions">
        <Link to="/auth/signin" className="docs-btn docs-btn--primary">Create account</Link>
        <Link to="/resources/help" className="docs-btn docs-btn--ghost">Help Center</Link>
      </div>
    </article>
  );
}

export default function DocsQuickStart({ page }) {
  const features = page.features?.length ? page.features : DOC_FEATURES;
  const steps = page.accountSteps?.length ? page.accountSteps : DOC_ACCOUNT_STEPS;
  const checks = page.profileChecks?.length ? page.profileChecks : DOC_PROFILE_CHECKS;
  const whatBody =
    page.whatBody ||
    'EventThon Network is the workspace for creators and companies — squads, projects, gigs, jobs, Thon rewards, and donations in one place.';
  const nextBody =
    page.nextBody ||
    'Explore Guides, try a tutorial, or join Community when you are ready to ship with a squad.';
  const updated = page.updated || DOC_UPDATED;

  return (
    <article className="docs-article">
      <div className="docs-article__top">
        <h1 className="docs-article__title">Quick Start</h1>
        <p className="docs-article__intro">{page.intro}</p>
        <p className="docs-article__meta">Last updated: {updated}</p>
      </div>

      {page.callout ? (
        <div className="docs-callout" role="note">
          <FiInfo size={18} aria-hidden />
          <p>{page.callout}</p>
        </div>
      ) : null}

      <section id="what" className="docs-block">
        <div className="docs-block__copy">
          <h2>What is EventThon?</h2>
          <p>{whatBody}</p>
        </div>
        <ul className="docs-features" aria-label="Platform pillars">
          {features.map((f) => (
            <li key={f.id || f.label || f}>{f.label || f}</li>
          ))}
        </ul>
      </section>

      <section id="account-steps" className="docs-block">
        <div className="docs-block__copy">
          <h2>1. Create Your Account</h2>
          <ol className="docs-steps">
            {steps.map((step, i) => (
              <li key={step}>
                <span className="docs-steps__num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Link to="/auth/signin" className="docs-btn docs-btn--primary">Go to Sign Up</Link>
        </div>
      </section>

      <section id="profile-steps" className="docs-block">
        <div className="docs-block__copy">
          <h2>2. Build Your Profile</h2>
          <ul className="docs-checks">
            {checks.map((item) => (
              <li key={item}>
                <FiCheckCircle size={16} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/profile" className="docs-btn docs-btn--ghost">Open profile</Link>
        </div>
      </section>

      <section id="next" className="docs-block docs-block--next">
        <h2>3. Next Steps</h2>
        <p>{nextBody}</p>
        <div className="docs-article__actions">
          <Link to="/resources/guides" className="docs-btn docs-btn--primary">Browse Guides</Link>
          <Link to="/resources/tutorials" className="docs-btn docs-btn--ghost">Watch Tutorials</Link>
        </div>
      </section>
    </article>
  );
}
