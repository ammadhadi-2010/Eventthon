import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { topbarIcons } from '../data/adminConfig';
import FooterCmsSidebarLink from './FooterCmsSidebarLink';

const { sparkles: Sparkles } = topbarIcons;
const base =
  'admin-action-btn flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition-colors';
const inactive = 'border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-white';
const activeCls =
  'border-violet-500/25 bg-violet-500/12 text-white shadow-[0_0_24px_-14px_rgba(139,92,246,0.7)]';

function SidebarCompaniesGroup({ item, onNavigate }) {
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  const childActive = item.children?.some((child) => {
    const [childPath, childHash = ''] = child.to.split('#');
    return pathname === childPath && (!childHash || hash === `#${childHash}`);
  });
  const active = pathname.startsWith('/admin-control/companies') || childActive;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${base} ${active ? activeCls : inactive}`}
        aria-expanded={open}
      >
        <Icon size={16} className={active ? 'text-violet-400' : 'text-slate-500'} />
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">{item.label}</span>
          <ChevronDown
            size={15}
            className={`shrink-0 transition-transform ${open ? 'rotate-180 text-violet-300' : 'text-slate-500'}`}
          />
        </span>
      </button>
      {open ? (
        <div className="ml-4 space-y-1 border-l border-white/5 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.to}
              end={child.id === 'companies-all'}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-violet-500/12 text-violet-200'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`
              }
            >
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate">{child.label}</span>
                {child.badge != null ? (
                  <span className="rounded-md bg-violet-600/80 px-1.5 py-0.5 text-[10px] font-black text-white">
                    {child.badge}
                  </span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminSidebar({ items, drawerOpen = false, onNavigate }) {
  const handleNav = () => {
    if (typeof onNavigate === 'function') onNavigate();
  };

  return (
    <aside
      className={`admin-sidebar fixed inset-y-0 left-0 z-[60] flex h-full w-64 max-w-[85vw] flex-col overflow-y-auto transition-transform duration-300 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="pt-2">
        <p className="px-3 pb-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
          Admin Navigation
        </p>
        <nav className="space-y-1">
          {items.map((item, index) => {
            const showSection =
              item.section && (index === 0 || items[index - 1]?.section !== item.section);

            if (item.variant === 'footer-cms' && item.to) {
              return (
                <React.Fragment key={item.id}>
                  {showSection ? (
                    <p className="px-3 pt-4 pb-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                      {item.section}
                    </p>
                  ) : null}
                  <FooterCmsSidebarLink to={item.to} onNavigate={handleNav} />
                </React.Fragment>
              );
            }

            if (item.children?.length) {
              return <SidebarCompaniesGroup key={item.id} item={item} onNavigate={handleNav} />;
            }

            const Icon = item.icon;

            if (item.to) {
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.id === 'dashboard'}
                  onClick={handleNav}
                  className={({ isActive }) => `${base} ${isActive ? activeCls : inactive}`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-violet-400' : 'text-slate-500'} />
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate">{item.label}</span>
                        {item.badge != null ? (
                          <span className="shrink-0 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                disabled
                className={`${base} cursor-not-allowed border-transparent text-slate-500 opacity-55`}
              >
                <Icon size={16} className="text-slate-600" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.badge != null ? (
                    <span className="shrink-0 rounded-md bg-violet-600/80 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 rounded-[22px] border border-violet-500/15 bg-gradient-to-br from-violet-500/15 to-blue-500/10 p-4">
        <div className="mb-3 inline-flex rounded-xl bg-violet-500/20 p-2.5 text-violet-300">
          <Sparkles size={16} />
        </div>
        <h3 className="text-sm font-black">Admin User</h3>
        <p className="mt-1 text-[11px] font-bold text-violet-300/90">Super Admin</p>
        <p className="mt-2 inline-flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          Online
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08]"
        >
          View Documentation
        </button>
      </div>
    </aside>
  );
}
