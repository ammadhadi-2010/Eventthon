import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import LegalDocLayout from '../components/LegalDocLayout';
import { TERMS_SECTIONS } from '../data/legalData';

export default function TermsOfService() {
  return (
    <FooterPageShell variant="company">
      <LegalDocLayout title="Terms of Service" sections={TERMS_SECTIONS} />
    </FooterPageShell>
  );
}
