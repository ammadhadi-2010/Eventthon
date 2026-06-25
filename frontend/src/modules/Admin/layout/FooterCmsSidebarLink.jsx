import React from 'react';
import { NavLink } from 'react-router-dom';

function FooterCmsIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v6h6" />
    </svg>
  );
}

export default function FooterCmsSidebarLink({ to, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        `w-full flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl transition-all gap-3 cursor-pointer group ${
          isActive
            ? 'text-cyan-400 bg-slate-900/60'
            : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <FooterCmsIcon
            className={`h-4 w-4 shrink-0 ${
              isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
            }`}
          />
          <span>Footer CMS Hub</span>
        </>
      )}
    </NavLink>
  );
}
