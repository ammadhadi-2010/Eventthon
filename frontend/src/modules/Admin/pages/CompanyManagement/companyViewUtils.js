/** Proof document object for admin viewer — uses exact key `imageurl`. */
export function buildCompanyProofDocument(row) {
  const source = row && typeof row === 'object' ? row : {};
  const proof = String(
    source.verificationProofImageurl || source.verification_proof_imageurl || '',
  ).trim();
  return { imageurl: proof };
}

export function companyRowFromDetail(detail) {
  if (!detail) return null;
  return {
    id: detail.id,
    name: detail.name,
    status: detail.status,
    isVerified: detail.isVerified,
    imageurl: detail.imageurl,
    verificationProofImageurl: detail.verificationProofImageurl,
  };
}
