import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import AdminDonationImageUpload from './AdminDonationImageUpload';
import useAdminDonations from './useAdminDonations';
import { uploadAdminDonationOrgLogo } from '../../../Donation/donationApi';
import './admin-donation.css';

function Field({ label, children, hint }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {children}
      {hint ? <small className="adm-hint">{hint}</small> : null}
    </label>
  );
}

function ListEditor({ title, rows, fields, onChange }) {
  return (
    <div className="adm-subblock">
      <h3>{title}</h3>
      {rows.map((row, index) => (
        <div key={`${title}-${index}`} className="adm-inline-grid">
          {fields.map((field) => (
            <Field key={field.key} label={field.label}>
              <input
                value={row[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </Field>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminDonationManagementPage() {
  const state = useAdminDonations();
  const [tab, setTab] = useState('settings');
  const settings = state.config?.settings || {};

  if (state.loading) {
    return <div className="admin-donation admin-panel"><p className="adm-status">Loading donation hub…</p></div>;
  }

  return (
    <div className="admin-donation admin-panel">
      <header className="adm-head adm-head--row">
        <div>
          <h1>Donation Hub</h1>
          <p>Every change here syncs to the public <strong>/donate</strong> page, home feed card, and donation modal.</p>
        </div>
        <div className="adm-head__actions">
          <Link to="/donate/learn-more" target="_blank" rel="noreferrer" className="adm-btn">
            <FiExternalLink size={14} aria-hidden /> View Learn More
          </Link>
          <Link to="/donate" target="_blank" rel="noreferrer" className="adm-btn">
            <FiExternalLink size={14} aria-hidden /> View live page
          </Link>
          <button type="button" className="adm-btn" disabled={state.saving} onClick={state.reload}>
            <FiRefreshCw size={14} aria-hidden /> Reload
          </button>
        </div>
      </header>

      {state.status ? <p className="adm-status">{state.status}</p> : null}

      <div className="adm-tabs">
        {['settings', 'causes', 'organizations', 'intents'].map((key) => (
          <button key={key} type="button" className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'settings' ? (
        <section className="adm-card">
          <h2>Page settings (synced to /donate)</h2>
          <div className="adm-grid">
            <Field label="Hero title">
              <input value={settings.heroTitle || ''} onChange={(e) => state.updateSettingsField('heroTitle', e.target.value)} />
            </Field>
            <Field label="Hero subtitle">
              <textarea rows={3} value={settings.heroSubtitle || ''} onChange={(e) => state.updateSettingsField('heroSubtitle', e.target.value)} />
            </Field>
            <AdminDonationImageUpload
              label="Hero image"
              slot="hero"
              hint="Upload saves instantly and appears on /donate hero section."
              imageUrl={settings.heroImageUrl}
              disabled={state.saving}
              onUploaded={state.onImageUploaded}
              onClear={() => state.clearImage('hero')}
            />
            <Field label="Reward card title">
              <input value={settings.rewardTitle || ''} onChange={(e) => state.updateSettingsField('rewardTitle', e.target.value)} />
            </Field>
            <Field label="Reward card subtitle">
              <input value={settings.rewardSubtitle || ''} onChange={(e) => state.updateSettingsField('rewardSubtitle', e.target.value)} />
            </Field>
            <AdminDonationImageUpload
              label="Reward card image"
              slot="reward"
              hint="Upload saves instantly and appears on the reward card on /donate."
              imageUrl={settings.rewardImageUrl}
              disabled={state.saving}
              onUploaded={state.onImageUploaded}
              onClear={() => state.clearImage('reward')}
            />
            <Field label="Invite section title">
              <input value={settings.inviteTitle || ''} onChange={(e) => state.updateSettingsField('inviteTitle', e.target.value)} />
            </Field>
            <Field label="Invite section subtitle">
              <input value={settings.inviteSubtitle || ''} onChange={(e) => state.updateSettingsField('inviteSubtitle', e.target.value)} />
            </Field>
            <Field label="Invite button link">
              <input value={settings.inviteLink || '/'} onChange={(e) => state.updateSettingsField('inviteLink', e.target.value)} />
            </Field>
            <Field label="Profit pledge %" hint="Use {percent} in feed card text to auto-fill.">
              <input type="number" min="0" max="100" value={settings.profitPledgePercent ?? 12} onChange={(e) => state.updateSettingsField('profitPledgePercent', Number(e.target.value))} />
            </Field>
            <Field label="Feed card title">
              <input value={settings.feedCardTitle || ''} onChange={(e) => state.updateSettingsField('feedCardTitle', e.target.value)} />
            </Field>
            <Field label="Feed card subtitle">
              <textarea rows={2} value={settings.feedCardSubtitle || ''} onChange={(e) => state.updateSettingsField('feedCardSubtitle', e.target.value)} />
            </Field>
            <Field label="Preset Thon amounts (comma separated)">
              <input
                value={(settings.presetAmounts || []).join(', ')}
                onChange={(e) => state.updateSettingsField('presetAmounts', e.target.value.split(',').map((n) => Number(n.trim())).filter((n) => n > 0))}
              />
            </Field>
            <label className="adm-check">
              <input type="checkbox" checked={Boolean(settings.feedCardEnabled)} onChange={(e) => state.updateSettingsField('feedCardEnabled', e.target.checked)} />
              Show &quot;Support a Cause&quot; card in home feed
            </label>
          </div>

          <ListEditor
            title="Hero feature chips"
            rows={settings.heroFeatures || []}
            fields={[
              { key: 'iconKey', label: 'Icon key', placeholder: 'users, shield, gift…' },
              { key: 'text', label: 'Text', placeholder: 'Verified Organizations' },
            ]}
            onChange={(index, field, value) => state.updateSettingsListItem('heroFeatures', index, field, value)}
          />

          <ListEditor
            title="How it works steps"
            rows={settings.steps || []}
            fields={[
              { key: 'title', label: 'Title', placeholder: 'Choose a Cause' },
              { key: 'text', label: 'Description', placeholder: 'Pick what matters most…' },
            ]}
            onChange={(index, field, value) => state.updateSettingsListItem('steps', index, field, value)}
          />

          <ListEditor
            title="Our commitment items"
            rows={settings.commitments || []}
            fields={[
              { key: 'iconKey', label: 'Icon key', placeholder: 'shield, heart, gift…' },
              { key: 'title', label: 'Title', placeholder: 'Verified Partners Only' },
              { key: 'text', label: 'Text', placeholder: 'Every organization is reviewed…' },
            ]}
            onChange={(index, field, value) => state.updateSettingsListItem('commitments', index, field, value)}
          />

          <div className="adm-subblock">
            <h3>Learn More page (/donate/learn-more)</h3>
          </div>
          <div className="adm-grid">
            <Field label="Learn More title">
              <input value={settings.learnMoreTitle || ''} onChange={(e) => state.updateSettingsField('learnMoreTitle', e.target.value)} />
            </Field>
            <Field label="Learn More subtitle">
              <input value={settings.learnMoreSubtitle || ''} onChange={(e) => state.updateSettingsField('learnMoreSubtitle', e.target.value)} />
            </Field>
            <Field label="Learn More intro">
              <textarea rows={4} value={settings.learnMoreIntro || ''} onChange={(e) => state.updateSettingsField('learnMoreIntro', e.target.value)} />
            </Field>
            <AdminDonationImageUpload
              label="Learn More hero image"
              slot="learnmore"
              hint="Optional banner for Learn More page. Upload saves instantly."
              imageUrl={settings.learnMoreImageUrl}
              disabled={state.saving}
              onUploaded={state.onImageUploaded}
              onClear={() => state.clearImage('learnmore')}
            />
          </div>
          <ListEditor
            title="Learn More content sections"
            rows={settings.learnMoreSections || []}
            fields={[
              { key: 'title', label: 'Section title', placeholder: 'Our Mission' },
              { key: 'text', label: 'Section text', placeholder: 'Explain this topic…' },
            ]}
            onChange={(index, field, value) => state.updateSettingsListItem('learnMoreSections', index, field, value)}
          />

          <button type="button" className="adm-btn adm-btn--primary" disabled={state.saving} onClick={state.saveSettings}>
            Save all page settings
          </button>
        </section>
      ) : null}

      {tab === 'causes' ? (
        <div className="adm-split">
          <section className="adm-card">
            <h2>{state.causeDraft.id ? 'Edit cause' : 'Add cause'}</h2>
            <div className="adm-grid">
              <Field label="ID (slug)"><input value={state.causeDraft.id} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, id: e.target.value })} /></Field>
              <Field label="Label"><input value={state.causeDraft.label} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, label: e.target.value })} /></Field>
              <Field label="Icon key"><input value={state.causeDraft.iconKey} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, iconKey: e.target.value })} placeholder="heart, book, users…" /></Field>
              <Field label="Color"><input value={state.causeDraft.color} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, color: e.target.value })} /></Field>
              <Field label="Sort order"><input type="number" value={state.causeDraft.sortOrder} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, sortOrder: Number(e.target.value) })} /></Field>
              <label className="adm-check"><input type="checkbox" checked={state.causeDraft.active} onChange={(e) => state.setCauseDraft({ ...state.causeDraft, active: e.target.checked })} /> Active on /donate</label>
            </div>
            <div className="adm-actions-row">
              <button type="button" className="adm-btn adm-btn--primary" disabled={state.saving} onClick={state.saveCause}>Save cause</button>
              <button type="button" className="adm-btn" disabled={state.saving} onClick={state.resetCauseDraft}>Clear form</button>
            </div>
          </section>
          <section className="adm-card">
            <h2>Causes ({state.config?.causes?.length || 0})</h2>
            <ul className="adm-list">
              {(state.config?.causes || []).map((row) => (
                <li key={row.id}>
                  <div><strong>{row.label}</strong><span>{row.id}{row.active ? '' : ' · hidden'}</span></div>
                  <div className="adm-list__actions">
                    <button type="button" onClick={() => state.editCause(row)}>Edit</button>
                    {row.id !== 'all' ? <button type="button" className="danger" onClick={() => state.removeCause(row.id)}>Delete</button> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'organizations' ? (
        <div className="adm-split">
          <section className="adm-card">
            <h2>{state.orgDraft.id ? 'Edit organization' : 'Add organization'}</h2>
            <div className="adm-grid">
              <Field label="ID"><input value={state.orgDraft.id} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, id: e.target.value })} /></Field>
              <Field label="Name"><input value={state.orgDraft.name} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, name: e.target.value })} /></Field>
              <Field label="Description"><textarea rows={3} value={state.orgDraft.description} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, description: e.target.value })} /></Field>
              <Field label="Website"><input value={state.orgDraft.website} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, website: e.target.value })} placeholder="https://example.org" /></Field>
              <AdminDonationImageUpload
                label="Organization logo image"
                hint="Upload logo for /donate cards. Set ID first, then upload. Click Save organization after."
                imageUrl={state.orgDraft.logoImageUrl}
                disabled={state.saving}
                customUpload={(file) => uploadAdminDonationOrgLogo(file, state.orgDraft.id)}
                onUploaded={(result) => state.setOrgDraft({ ...state.orgDraft, logoImageUrl: result.url })}
                onClear={() => state.setOrgDraft({ ...state.orgDraft, logoImageUrl: '' })}
              />
              <Field label="Logo image URL" hint="Or paste a URL manually (upload fills this automatically).">
                <input
                  value={state.orgDraft.logoImageUrl || ''}
                  onChange={(e) => state.setOrgDraft({ ...state.orgDraft, logoImageUrl: e.target.value })}
                  placeholder="/static/uploads/donation/org-alkhidmat-....png"
                />
              </Field>
              <Field label="Causes (comma separated ids)"><input value={state.orgDraft.causesText || ''} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, causesText: e.target.value })} /></Field>
              <Field label="Logo text"><input value={state.orgDraft.logo} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, logo: e.target.value })} /></Field>
              <Field label="Color"><input value={state.orgDraft.color} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, color: e.target.value })} /></Field>
              <Field label="Sort order"><input type="number" value={state.orgDraft.sortOrder} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, sortOrder: Number(e.target.value) })} /></Field>
              <label className="adm-check"><input type="checkbox" checked={state.orgDraft.verified} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, verified: e.target.checked })} /> Verified badge</label>
              <label className="adm-check"><input type="checkbox" checked={state.orgDraft.active} onChange={(e) => state.setOrgDraft({ ...state.orgDraft, active: e.target.checked })} /> Active on /donate</label>
            </div>
            <div className="adm-actions-row">
              <button type="button" className="adm-btn adm-btn--primary" disabled={state.saving} onClick={state.saveOrg}>Save organization</button>
              <button type="button" className="adm-btn" disabled={state.saving} onClick={state.resetOrgDraft}>Clear form</button>
            </div>
          </section>
          <section className="adm-card">
            <h2>Organizations ({state.config?.organizations?.length || 0})</h2>
            <ul className="adm-list">
              {(state.config?.organizations || []).map((row) => (
                <li key={row.id}>
                  <div><strong>{row.name}</strong><span>{row.website}{row.active ? '' : ' · hidden'}</span></div>
                  <div className="adm-list__actions">
                    <button type="button" onClick={() => state.editOrg(row)}>Edit</button>
                    <button type="button" className="danger" onClick={() => state.removeOrg(row.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'intents' ? (
        <section className="adm-card">
          <div className="adm-card__head-row">
            <h2>Recent donation attempts ({state.intents.length})</h2>
            <button type="button" className="adm-btn" disabled={state.saving} onClick={state.refreshIntents}>
              <FiRefreshCw size={14} aria-hidden /> Refresh
            </button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>When</th><th>Org</th><th>Amount</th><th>User</th><th>Status</th></tr>
              </thead>
              <tbody>
                {state.intents.length ? state.intents.map((row) => (
                  <tr key={row.id}>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                    <td>{row.organizationName || row.organizationId}</td>
                    <td>{Number(row.amountThon || 0).toLocaleString()} Thon</td>
                    <td>{row.userName || row.userEmail || 'Guest'}</td>
                    <td>{row.status}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>No donation attempts logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
