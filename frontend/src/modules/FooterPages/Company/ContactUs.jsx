import React, { useState } from 'react';
import { FiClock, FiMail, FiMapPin } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    window.alert('Thank you. Our team will respond within one business day.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <FooterPageShell variant="company">
      <PageHero title="Contact Us" subtitle="Reach the EventThon team for support, partnerships, or press." />
      <div className="fp-grid-2">
        <div>
          <div className="fp-card">
            <FiMail style={{ color: '#8b5cf6' }} />
            <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#f1f5f9' }}>hello@eventthon.com</p>
          </div>
          <div className="fp-card">
            <FiMapPin style={{ color: '#8b5cf6' }} />
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>1200 Innovation Drive, Suite 400<br />San Francisco, CA</p>
          </div>
          <div className="fp-card">
            <FiClock style={{ color: '#8b5cf6' }} />
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>Mon–Fri, 9:00 AM – 6:00 PM PST</p>
          </div>
        </div>
        <form className="fp-card" onSubmit={onSubmit}>
          <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Send a message</h2>
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
          <button type="submit" className="et-guest-popup__primary" style={{ width: '100%' }}>Submit</button>
        </form>
      </div>
    </FooterPageShell>
  );
}
