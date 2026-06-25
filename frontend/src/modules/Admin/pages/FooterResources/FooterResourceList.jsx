import React from 'react';
import { FooterResourceImagePreview } from './FooterResourceFieldKit';

function metaLine(row) {
  const bits = [row.footerBlock || '', row.category, row.slug ? `/${row.slug}` : ''];
  if (row.sidebarOrder != null && row.sidebarOrder !== 0) bits.push(`order ${row.sidebarOrder}`);
  if (row.readTime) bits.push(row.readTime);
  if (row.pricingPrice) bits.push(row.pricingPrice);
  if (row.jobTitle) bits.push(row.jobTitle);
  if (row.contactEmail) bits.push(row.contactEmail);
  if (row.policyVersion) bits.push(row.policyVersion);
  if (row.externalUrl) bits.push('external');
  return bits.filter(Boolean).join(' · ');
}

export default function FooterResourceList({ rows, loading, onEdit, onDelete }) {
  if (loading) return <p className="text-xs text-slate-200">Loading resources...</p>;
  if (!rows.length) {
    return <p className="text-xs text-slate-200">No footer resources yet. Create your first entry above.</p>;
  }

  return (
    <ul className="w-full flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="w-full rounded-xl border border-slate-800 bg-[#111622] p-3 flex flex-col gap-2"
        >
          <div className="w-full flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{row.title}</p>
              <p className="text-[11px] text-slate-200 break-words">{metaLine(row)}</p>
              {row.authorName ? (
                <p className="text-[11px] text-slate-300 mt-0.5">By {row.authorName}</p>
              ) : null}
              {row.excerpt ? (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{row.excerpt}</p>
              ) : null}
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={() => onEdit(row)} className="text-[11px] font-semibold text-blue-300">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(row.id)} className="text-[11px] font-semibold text-rose-300">
                Delete
              </button>
            </div>
          </div>
          <FooterResourceImagePreview imageurl={row.imageurl} alt="" />
        </li>
      ))}
    </ul>
  );
}
