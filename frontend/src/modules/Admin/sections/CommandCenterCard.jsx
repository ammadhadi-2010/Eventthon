import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandCenterCard({ cards }) {
  const navigate = useNavigate();

  return (
    <div className="admin-card-dark p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">Command Center</h3>
      </div>
      <div className="admin-command-grid admin-command-grid--inline">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => card.to && navigate(card.to)}
              className={`admin-command-card bg-gradient-to-br ${card.color} p-4 text-left transition-transform hover:-translate-y-0.5`}
            >
              <div className="mb-3 inline-flex rounded-xl bg-black/20 p-3 text-white">
                <Icon size={16} />
              </div>
              <div className="text-sm font-black text-white">{card.label}</div>
              <div className="mt-2 text-xs leading-relaxed text-slate-400">{card.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
