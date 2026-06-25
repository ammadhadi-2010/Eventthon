import React, { useRef } from 'react';
import { CloudUpload, FolderKanban, MessageSquare, Shield, Users } from 'lucide-react';

const TOGGLES = [
  { key: 'allowMemberInvites', label: 'Allow Member Invites', hint: 'Members can invite others to this squad', icon: Users },
  { key: 'requireAdminApproval', label: 'Require Admin Approval', hint: 'New members need admin approval', icon: Shield },
  { key: 'enableProjects', label: 'Enable Projects', hint: 'Allow project creation in this squad', icon: FolderKanban },
  { key: 'enableChat', label: 'Enable Chat', hint: 'Enable real-time chat for members', icon: MessageSquare },
];

export default function CreateSquadPermissionsSection({ form, onChange, onToggle }) {
  const fileRef = useRef(null);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange('bannerPreview', reader.result);
      onChange('bannerFile', file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="cs-section">
      <header className="cs-section__head">
        <span className="cs-section__num">3</span>
        <div>
          <h3>Permission Settings</h3>
          <p>Squad image and member permissions.</p>
        </div>
      </header>

      <button type="button" className="cs-upload" onClick={() => fileRef.current?.click()}>
        {form.bannerPreview ? (
          <img src={form.bannerPreview} alt="" className="cs-upload__preview" />
        ) : (
          <>
            <CloudUpload size={28} aria-hidden />
            <strong>Click to upload image</strong>
            <span>JPG, PNG or GIF (Max. 5MB)</span>
          </>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

      <div className="cs-toggles">
        {TOGGLES.map((item) => {
          const Icon = item.icon;
          const on = form[item.key];
          return (
            <div key={item.key} className="cs-toggle-row">
              <div className="cs-toggle-row__copy">
                <Icon size={16} aria-hidden />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </div>
              </div>
              <button
                type="button"
                className={`cs-switch${on ? ' is-on' : ''}`}
                onClick={() => onToggle(item.key)}
                aria-pressed={on}
              >
                <span />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
