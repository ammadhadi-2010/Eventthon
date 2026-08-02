import React, { useMemo } from 'react';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import {
  EMPTY_JOURNEY_STEP,
  EMPTY_TEAM_MEMBER,
  parseAboutJourney,
  parseAboutTeam,
  serializeAboutJourney,
  serializeAboutTeam,
  parseFeedFlag,
  serializeFeedFlag,
} from '../../../FooterPages/utils/aboutCmsUtils';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';

function RepeatBlock({ title, hint, onAdd, addLabel, sectionId, children }) {
  return (
    <div id={sectionId} className="w-full rounded-xl border border-slate-800 bg-[#0a1020] p-3 space-y-3 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-white">{title}</p>
          {hint ? <p className="text-[11px] text-slate-300 mt-0.5">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-violet-500/60 bg-violet-600/20 px-3 py-1.5 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35 self-start"
        >
          {addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

export default function AboutUsAdminFields({ formData, onChange, onMediaUploaded, saving }) {
  const journeySteps = useMemo(() => parseAboutJourney(formData.aboutJourney), [formData.aboutJourney]);
  const teamMembers = useMemo(() => parseAboutTeam(formData.aboutTeam), [formData.aboutTeam]);

  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  const updateJourney = (nextSteps) => {
    onChange({ ...formData, aboutJourney: serializeAboutJourney(nextSteps) });
  };

  const updateTeam = (nextMembers) => {
    onChange({ ...formData, aboutTeam: serializeAboutTeam(nextMembers) });
  };

  const patchJourneyStep = (index, patch) => {
    const next = journeySteps.map((step, i) => (i === index ? { ...step, ...patch } : step));
    updateJourney(next);
  };

  const patchTeamMember = (index, patch) => {
    const next = teamMembers.map((member, i) => (i === index ? { ...member, ...patch } : member));
    updateTeam(next);
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100">
        <strong className="text-white">About Us CMS</strong> — scroll down for{' '}
        <strong>Our Journey</strong> milestones and <strong>Leadership Team</strong> members below the cover image.
      </div>

      <FooterField
        id="footer-about-excerpt"
        label="About Summary"
        hint="Shows under the page title on the public About Us page."
      >
        <FooterTextArea
          id="footer-about-excerpt"
          value={formData.excerpt}
          onChange={setField('excerpt')}
          placeholder="EventThon is a modern professional networking platform..."
          maxLength={2000}
          rows={4}
        />
      </FooterField>

      <FooterField
        id="footer-about-content"
        label="About Content"
        hint="Main story copy. Each paragraph can be separated by a blank line."
      >
        <FooterTextArea
          id="footer-about-content"
          value={formData.content}
          onChange={setField('content')}
          placeholder="Write your mission, vision, and company story here..."
          maxLength={12000}
          rows={8}
        />
      </FooterField>

      <FooterField id="footer-about-image" label="About Cover Image URL">
        <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
        <FooterTextInput
          id="footer-about-image"
          value={formData.imageurl}
          onChange={setField('imageurl')}
          placeholder="https://..."
          maxLength={500}
        />
        <FooterResourceImagePreview imageurl={formData.imageurl} tall />
      </FooterField>

      <RepeatBlock
        title="Our Journey"
        hint="Add as many milestones as you need. They appear in order on the public page."
        addLabel="+ Add journey step"
        onAdd={() => updateJourney([...journeySteps, { ...EMPTY_JOURNEY_STEP }])}
        sectionId="about-cms-journey"
      >
        {!journeySteps.length ? (
          <p className="text-[11px] text-slate-400">No journey steps yet.</p>
        ) : null}
        {journeySteps.map((step, index) => (
          <div key={`journey-${index}`} className="rounded-lg border border-slate-800 bg-[#111622] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-200">Step {index + 1}</p>
              <button
                type="button"
                onClick={() => updateJourney(journeySteps.filter((_, i) => i !== index))}
                className="text-[11px] font-semibold text-rose-300"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FooterTextInput
                id={`footer-journey-year-${index}`}
                value={step.year}
                onChange={(e) => patchJourneyStep(index, { year: e.target.value })}
                placeholder="2024"
                maxLength={12}
              />
              <FooterTextInput
                id={`footer-journey-title-${index}`}
                value={step.title}
                onChange={(e) => patchJourneyStep(index, { title: e.target.value })}
                placeholder="Milestone title"
                maxLength={120}
              />
            </div>
            <FooterTextArea
              id={`footer-journey-text-${index}`}
              value={step.text}
              onChange={(e) => patchJourneyStep(index, { text: e.target.value })}
              placeholder="What happened in this milestone..."
              maxLength={2000}
              rows={3}
            />
          </div>
        ))}
      </RepeatBlock>

      <RepeatBlock
        title="Leadership Team"
        hint="Add unlimited team members with name, role, bio, and optional photo."
        addLabel="+ Add team member"
        onAdd={() => updateTeam([...teamMembers, { ...EMPTY_TEAM_MEMBER }])}
        sectionId="about-cms-team"
      >
        {!teamMembers.length ? (
          <p className="text-[11px] text-slate-400">No team members yet.</p>
        ) : null}
        {teamMembers.map((member, index) => (
          <div key={`team-${index}`} className="rounded-lg border border-slate-800 bg-[#111622] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-200">Member {index + 1}</p>
              <button
                type="button"
                onClick={() => updateTeam(teamMembers.filter((_, i) => i !== index))}
                className="text-[11px] font-semibold text-rose-300"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FooterTextInput
                id={`footer-team-name-${index}`}
                value={member.name}
                onChange={(e) => patchTeamMember(index, { name: e.target.value })}
                placeholder="Full name"
                maxLength={120}
              />
              <FooterTextInput
                id={`footer-team-role-${index}`}
                value={member.role}
                onChange={(e) => patchTeamMember(index, { role: e.target.value })}
                placeholder="Role / title"
                maxLength={120}
              />
            </div>
            <FooterTextInput
              id={`footer-team-initials-${index}`}
              value={member.initials}
              onChange={(e) => patchTeamMember(index, { initials: e.target.value })}
              placeholder="Initials (optional — auto from name)"
              maxLength={4}
            />
            <FooterTextArea
              id={`footer-team-bio-${index}`}
              value={member.bio || ''}
              onChange={(e) => patchTeamMember(index, { bio: e.target.value })}
              placeholder="Short bio — experience, focus, background..."
              maxLength={600}
              rows={3}
            />
            <FooterField id={`footer-team-avatar-${index}`} label="Member Photo URL">
              <FooterMediaSubmitButton
                onUploaded={(_field, url) => patchTeamMember(index, { avatarUrl: url })}
                disabled={saving}
              />
              <FooterTextInput
                id={`footer-team-avatar-${index}`}
                value={member.avatarUrl}
                onChange={(e) => patchTeamMember(index, { avatarUrl: e.target.value })}
                placeholder="https://..."
                maxLength={500}
              />
              <FooterResourceImagePreview imageurl={member.avatarUrl} alt={member.name || 'Team member'} />
            </FooterField>
          </div>
        ))}
      </RepeatBlock>

      <div className="w-full rounded-xl border border-slate-800 bg-[#0a1020] p-3 space-y-3">
        <p className="text-xs font-bold text-white">Home feed visibility</p>
        <label className="flex items-center gap-2 text-[12px] text-slate-200">
          <input
            type="checkbox"
            checked={parseFeedFlag(formData.aboutFeedJourney, true)}
            onChange={(e) => onChange({ ...formData, aboutFeedJourney: serializeFeedFlag(e.target.checked) })}
          />
          Show Our Journey card in the home feed
        </label>
        <label className="flex items-center gap-2 text-[12px] text-slate-200">
          <input
            type="checkbox"
            checked={parseFeedFlag(formData.aboutFeedTeam, true)}
            onChange={(e) => onChange({ ...formData, aboutFeedTeam: serializeFeedFlag(e.target.checked) })}
          />
          Show Leadership Team card in the home feed
        </label>
      </div>
    </>
  );
}
