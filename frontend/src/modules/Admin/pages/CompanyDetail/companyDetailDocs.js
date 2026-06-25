import { resolveCompanyImageurl } from '../CompanyManagement/companyImage';

export function buildCompanyVerificationDocs(company = {}) {
  const rows = [];
  const proofImageurl = String(company.verificationProofImageurl || '').trim();
  const logoImageurl = String(company.imageurl || '').trim();
  if (proofImageurl) {
    rows.push({
      id: 'verification-proof',
      label: 'Business registration proof',
      imageurl: proofImageurl,
      viewUrl: resolveCompanyImageurl(proofImageurl, company.name),
    });
  }
  if (logoImageurl && logoImageurl !== proofImageurl) {
    rows.push({
      id: 'company-logo',
      label: 'Company logo asset',
      imageurl: logoImageurl,
      viewUrl: resolveCompanyImageurl(logoImageurl, company.name),
    });
  }
  return rows;
}
