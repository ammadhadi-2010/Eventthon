import React from 'react';
import OppStepBasics from './steps/OppStepBasics';
import OppStepDetails from './steps/OppStepDetails';
import OppStepBudget from './steps/OppStepBudget';
import OppStepTiming from './steps/OppStepTiming';
import OppStepTeam from './steps/OppStepTeam';

export default function OpportunityStepRenderer({ currentStep, ...stepProps }) {
  switch (currentStep) {
    case 1:
      return <OppStepBasics {...stepProps} />;
    case 2:
      return <OppStepDetails {...stepProps} />;
    case 3:
      return <OppStepBudget {...stepProps} />;
    case 4:
      return <OppStepTiming {...stepProps} />;
    case 5:
      return <OppStepTeam {...stepProps} />;
    default:
      return null;
  }
}
