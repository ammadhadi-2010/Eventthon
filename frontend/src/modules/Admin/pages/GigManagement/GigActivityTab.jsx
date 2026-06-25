import React from 'react';
import { Briefcase, CheckCircle2, FileText, User } from 'lucide-react';

const ICONS = {
  proposal: User,
  publish: FileText,
  milestone: CheckCircle2,
  update: Briefcase,
};

export default function GigActivityTab({ activities = [] }) {
  if (!activities.length) {
    return <p className="gp-empty">No activity recorded yet.</p>;
  }

  return (
    <ul className="ga-timeline">
      {activities.map((item) => {
        const Icon = ICONS[item.type] || Briefcase;
        return (
          <li key={item.id} className="ga-timeline__item">
            <div className="ga-timeline__icon"><Icon size={14} /></div>
            <div>
              <p>{item.text}</p>
              <span>{item.at}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
