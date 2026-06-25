import React from 'react';
import { EDIT_PROFILE_STEPS } from './editProfileSteps';
import EditProfileSectionCard from './sections/EditProfileSectionCard';
import EditProfileBasicFields from './sections/EditProfileBasicFields';
import EditProfileAboutFields from './sections/EditProfileAboutFields';
import EditProfileExperienceFields from './sections/EditProfileExperienceFields';
import EditProfileProjectsFields from './sections/EditProfileProjectsFields';
import EditProfileSkillsNicheFields from './sections/EditProfileSkillsNicheFields';
import EditProfileIdentityFields from './sections/EditProfileIdentityFields';
import EditProfilePreferencesFields from './sections/EditProfilePreferencesFields';
import './editProfileLayout.css';

const SECTION_FIELDS = {
  basic: EditProfileBasicFields,
  about: EditProfileAboutFields,
  experience: EditProfileExperienceFields,
  projects: EditProfileProjectsFields,
  skills: EditProfileSkillsNicheFields,
  preferences: null,
};

/**
 * Center column: quick step strip + stacked sections; active step follows scroll + left rail.
 */
const EditProfileCenterColumn = ({
  draft,
  setDraft,
  userData,
  userIdentifier,
  refreshData,
  activeStepIndex = 0,
  onGoToStep,
  onAfterBasicContinue,
  onAfterAboutContinue,
  onBackAbout,
  onAfterExperienceContinue,
  onBackExperience,
  onAfterProjectsContinue,
  onBackProjects,
  onAfterSkillsContinue,
  onBackSkills,
  onAfterIdentityContinue,
  onBackIdentity,
  onBackPreferences,
  onAfterPreferencesContinue,
  onPreferencesSaved,
}) => (
  <div className="ep-center-stack flex min-w-0 max-w-full flex-col gap-5 pb-6 sm:gap-6 sm:pb-8">
    <nav className="ep-step-strip ep-root" aria-label="Profile steps">
      {EDIT_PROFILE_STEPS.map((step, idx) => (
        <button
          key={step.id}
          type="button"
          data-ep-step={step.id}
          onClick={() => {
            if (typeof onGoToStep === 'function') onGoToStep(idx);
          }}
          className={`ep-step-pill ${idx === activeStepIndex ? 'ep-step-pill--active' : ''}`}
        >
          <span className="ep-step-pill__num">{idx + 1}</span>
          <span className="ep-step-pill__label">{step.label}</span>
        </button>
      ))}
    </nav>

    {EDIT_PROFILE_STEPS.map((step, idx) => {
      const Body = SECTION_FIELDS[step.id];
      if (!Body && step.id !== 'preferences' && step.id !== 'identity') return null;
      return (
        <EditProfileSectionCard
          key={step.id}
          sectionId={`edit-section-${step.id}`}
          stepId={step.id}
          stepIndex={idx}
          label={step.label}
          hint={step.hint}
          hintInline={step.id === 'basic'}
          isActiveStep={idx === activeStepIndex}
          locked={false}
        >
          {step.id === 'basic' ? (
            <EditProfileBasicFields
              draft={draft}
              setDraft={setDraft}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onContinue={onAfterBasicContinue}
            />
          ) : step.id === 'about' ? (
            <EditProfileAboutFields
              draft={draft}
              setDraft={setDraft}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onBack={onBackAbout}
              onContinue={onAfterAboutContinue}
            />
          ) : step.id === 'experience' ? (
            <EditProfileExperienceFields
              draft={draft}
              setDraft={setDraft}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onBack={onBackExperience}
              onContinue={onAfterExperienceContinue}
            />
          ) : step.id === 'projects' ? (
            <EditProfileProjectsFields
              draft={draft}
              setDraft={setDraft}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onBack={onBackProjects}
              onContinue={onAfterProjectsContinue}
            />
          ) : step.id === 'skills' ? (
            <EditProfileSkillsNicheFields
              draft={draft}
              setDraft={setDraft}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onBack={onBackSkills}
              onContinue={onAfterSkillsContinue}
            />
          ) : step.id === 'identity' ? (
            <EditProfileIdentityFields
              userData={userData}
              refreshData={refreshData}
              onBack={onBackIdentity}
              onContinue={onAfterIdentityContinue}
            />
          ) : step.id === 'preferences' ? (
            <EditProfilePreferencesFields
              draft={draft}
              setDraft={setDraft}
              userData={userData}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              onPreferencesSaved={onPreferencesSaved}
              onBack={onBackPreferences}
              onContinue={onAfterPreferencesContinue}
            />
          ) : Body ? (
            <Body draft={draft} setDraft={setDraft} />
          ) : null}
        </EditProfileSectionCard>
      );
    })}
  </div>
);

export default EditProfileCenterColumn;
