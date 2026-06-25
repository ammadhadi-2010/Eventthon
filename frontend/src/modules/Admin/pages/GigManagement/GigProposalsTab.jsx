import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { gigAvatar } from './gigData';
import GigProposalModal from './GigProposalModal';

export default function GigProposalsTab({ proposals = [], onAccept, onReject, submitting = false }) {
  const [selected, setSelected] = useState(null);

  if (!proposals.length) {
    return <p className="gp-empty">No proposals submitted yet.</p>;
  }

  return (
    <>
      <div className="gd-rows">
        {proposals.map((p) => (
          <article key={p.id} className="gp-row">
            <div className="gp-row__user">
              <img src={p.avatarUrl || gigAvatar(p.freelancerName)} alt="" className="gp-row__avatar" />
              <div>
                <p className="gp-row__name">{p.freelancerName}</p>
                <span>{p.handle}</span>
              </div>
            </div>
            <span>{p.amount}</span>
            <span>{p.deliveryTime}</span>
            <span className="um-role-pill">{p.status}</span>
            <button type="button" className="gs-edit-btn" onClick={() => setSelected(p)}>
              <Eye size={14} />
              View
            </button>
          </article>
        ))}
      </div>
      <GigProposalModal
        open={Boolean(selected)}
        proposal={selected}
        onClose={() => setSelected(null)}
        onAccept={(p) => { onAccept?.(p); setSelected(null); }}
        onReject={(p) => { onReject?.(p); setSelected(null); }}
        submitting={submitting}
      />
    </>
  );
}
