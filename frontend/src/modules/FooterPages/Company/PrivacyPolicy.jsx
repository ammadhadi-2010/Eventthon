import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import LegalDocLayout from '../components/LegalDocLayout';
import { PRIVACY_SECTIONS } from '../data/legalData';

export default function PrivacyPolicy() {
  return (
    <FooterPageShell variant="company">
      <LegalDocLayout title="Privacy Policy" sections={PRIVACY_SECTIONS} />
    </FooterPageShell>
  );
}
