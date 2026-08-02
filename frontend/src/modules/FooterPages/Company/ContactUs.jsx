import React, { useState } from 'react';
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import useCompanyFooterContent from '../hooks/useCompanyFooterContent';
import '../styles/contact-us.css';

export default function ContactUs() {
  const { data, loading } = useCompanyFooterContent('Contact Us');
  const page = data || {
    subtitle: 'Reach the EventThon team for support, partnerships, or press.',
    intro: 'Reach the EventThon team for support, partnerships, or press.',
    context: '',
    contextParagraphs: [],
    email: 'hello@eventthon.com',
    phone: '',
    addressLines: ['1200 Innovation Drive, Suite 400', 'San Francisco, CA'],
    hours: 'Mon–Fri, 9:00 AM – 6:00 PM PST',
  };
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    window.alert('Thank you. Our team will respond within one business day.');
    setForm({ name: '', email: '', message: '' });
  };

  const contextParagraphs =
    page.contextParagraphs?.length > 0
      ? page.contextParagraphs
      : page.context
        ? [page.context]
        : [];

  return (
    <FooterPageShell variant="company">
      <PageHero title="Contact Us" subtitle={page.subtitle || page.intro} />
      {loading ? <p className="fp-body-text">Loading...</p> : null}

      {(page.intro || contextParagraphs.length > 0) ? (
        <section className="fp-card contact-copy" aria-label="Contact details from EventThon">
          {page.intro ? (
            <div className="contact-copy__block">
              <h2 className="contact-copy__label">Contact Intro</h2>
              <p className="contact-copy__text">{page.intro}</p>
            </div>
          ) : null}
          {contextParagraphs.length > 0 ? (
            <div className="contact-copy__block">
              <h2 className="contact-copy__label">Contact Context</h2>
              {contextParagraphs.map((para) => (
                <p key={para.slice(0, 48)} className="contact-copy__text">
                  {para}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="fp-grid-2 contact-grid">
        <div className="contact-info-col">
          <div className="fp-card contact-info-card">
            <FiMail className="contact-info-card__icon" aria-hidden />
            <p className="contact-info-card__label">Email</p>
            <a className="contact-info-card__value" href={`mailto:${page.email}`}>
              {page.email}
            </a>
          </div>
          {page.phone ? (
            <div className="fp-card contact-info-card">
              <FiPhone className="contact-info-card__icon" aria-hidden />
              <p className="contact-info-card__label">Phone</p>
              <a className="contact-info-card__value" href={`tel:${page.phone.replace(/\s+/g, '')}`}>
                {page.phone}
              </a>
            </div>
          ) : null}
          <div className="fp-card contact-info-card">
            <FiMapPin className="contact-info-card__icon" aria-hidden />
            <p className="contact-info-card__label">Location</p>
            <p className="contact-info-card__muted">
              {(page.addressLines || []).map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="fp-card contact-info-card">
            <FiClock className="contact-info-card__icon" aria-hidden />
            <p className="contact-info-card__label">Office Hours</p>
            <p className="contact-info-card__muted">{page.hours}</p>
          </div>
        </div>

        <form className="fp-card contact-form" onSubmit={onSubmit}>
          <h2 className="contact-form__title">Send a message</h2>
          {['name', 'email'].map((field) => (
            <input
              key={field}
              className="fp-search"
              type={field === 'email' ? 'email' : 'text'}
              placeholder={field === 'name' ? 'Your name' : 'Email address'}
              required
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              style={{ marginBottom: 12 }}
            />
          ))}
          <textarea
            className="fp-search"
            rows={5}
            placeholder="How can we help?"
            required
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            style={{ marginBottom: 14, resize: 'vertical' }}
          />
          <button type="submit" className="et-guest-popup__primary" style={{ width: '100%' }}>
            Submit
          </button>
        </form>
      </div>
    </FooterPageShell>
  );
}
