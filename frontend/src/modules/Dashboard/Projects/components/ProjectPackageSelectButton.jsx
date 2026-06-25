import React from 'react';
import { packageSelectLabel } from '../utils/projectPackageUtils';
import '../../SquadNetwork/styles/squad-project-detail.css';

export default function ProjectPackageSelectButton({
  activePackage,
  onSelect,
  selecting = false,
  confirmedKey = null,
  error = '',
}) {
  const isConfirmed = confirmedKey === activePackage;

  return (
    <div className="sq-pdv-package-cta">
      {error ? <p className="sq-pdv-join__error">{error}</p> : null}
      <button
        type="button"
        className="sq-pdv-package-cta__btn"
        disabled={selecting || isConfirmed}
        onClick={onSelect}
      >
        {selecting
          ? 'Submitting…'
          : isConfirmed
            ? 'Proposal submitted'
            : packageSelectLabel(activePackage)}
      </button>
    </div>
  );
}
