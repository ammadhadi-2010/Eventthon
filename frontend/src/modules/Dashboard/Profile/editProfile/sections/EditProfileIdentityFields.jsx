import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import IdentityVerify from '../../Sections/IdentityVerify';
import { isVerificationApproved, isVerificationPending } from '../verificationStatus';
import '../editProfileLayout.css';

/** Step 6 — government ID / KYC only (split from Skills & Niche). */
const EditProfileIdentityFields = ({ userData, refreshData, onBack, onContinue }) => {
  const [verificationBlocksNav, setVerificationBlocksNav] = useState(
    () => isVerificationPending(userData) && !isVerificationApproved(userData)
  );

  return (
    <div className="ep-sn-root ep-root space-y-5">
      <div className="ep-sn-verif-section">
        <div className="ep-sn-col-head">
          <h3 className="ep-sn-col-title">Verification</h3>
          <span
            className="ep-sn-info"
            title="Upload government ID (front & back). Same flow as on your profile — status syncs to your account."
          >
            <FiInfo className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
        <div className="ep-sn-verif-inner">
          <IdentityVerify
            userData={userData}
            refreshData={refreshData}
            onVerificationBlocking={setVerificationBlocksNav}
          />
        </div>
      </div>

      {!verificationBlocksNav ? (
        <div className="ep-about-footer ep-basic-footer">
          <button type="button" className="ep-btn-back-about" onClick={() => onBack?.()}>
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <button type="button" className="ep-btn-save-continue" onClick={() => onContinue?.()}>
            Continue
            <FiArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default EditProfileIdentityFields;
