import React from 'react';
import { FooterResourceImagePreview } from './FooterResourceFieldKit';
import { careersListHeadline } from './careersAdminUtils';

function metaLine(row) {
  if (row.category === 'Careers') {
    const bits = [
      row.excerpt ? `Dept: ${row.excerpt}` : '',
      row.jobLocation || '',
      row.sidebarOrder != null ? `order ${row.sidebarOrder}` : '',
      row.externalUrl ? 'apply URL' : 'mailto apply',
    ];
    return bits.filter(Boolean).join(' · ');
  }
  if (row.category === 'Tutorials') {
    const featured = Number(row.sidebarOrder || 0) < 100;
    return [
      row.excerpt || 'Beginner',
      row.readTime || '',
      row.pricingPrice ? `${row.pricingPrice} lessons` : '',
      row.pricingLabel || '',
      featured ? 'featured' : 'list',
      row.videourl ? 'has video' : 'no video',
    ].filter(Boolean).join(' · ');
  }
  if (row.category === 'Guides') {
    const featured = Number(row.sidebarOrder || 0) < 100;
    return [
      row.excerpt || 'Beginner',
      row.readTime || '',
      row.pricingPrice ? `${row.pricingPrice} steps` : '',
      row.pricingLabel || '',
      featured ? 'featured' : 'list',
    ].filter(Boolean).join(' · ');
  }
  if (row.category === 'Blog') {
    return [
      row.excerpt || 'Updates',
      row.authorName || '',
      row.policyVersion || '',
      row.readTime || '',
    ].filter(Boolean).join(' · ');
  }
  if (row.category === 'Case Studies') {
    const featured = Number(row.sidebarOrder || 0) === 0;
    return [
      row.excerpt || 'Business',
      row.authorName || '',
      row.policyVersion || '',
      row.readTime || '',
      featured ? 'featured' : `order ${row.sidebarOrder ?? 0}`,
    ].filter(Boolean).join(' · ');
  }
  const bits = [row.footerBlock || '', row.category, row.slug ? `/${row.slug}` : ''];
  if (row.sidebarOrder != null && row.sidebarOrder !== 0) bits.push(`order ${row.sidebarOrder}`);
  if (row.readTime) bits.push(row.readTime);
  if (row.pricingPrice) bits.push(row.pricingPrice);
  if (row.jobTitle) bits.push(row.jobTitle);
  if (row.contactEmail) bits.push(row.contactEmail);
  if (row.contactLocation) bits.push('location');
  if (row.contactPhone) bits.push(row.contactPhone);
  if (row.policyVersion) bits.push(row.policyVersion);
  if (row.externalUrl) bits.push('external');
  return bits.filter(Boolean).join(' · ');
}

function rowHeadline(row) {
  if (row.category === 'Careers') return careersListHeadline(row);
  return row.title;
}

export default function FooterResourceList({
  rows,
  loading,
  editingId = '',
  onEdit,
  onDelete,
  emptyHint,
}) {
  if (loading) return <p className="text-xs text-slate-200">Loading resources...</p>;
  if (!rows.length) {
    return (
      <p className="text-xs text-slate-200">
        {emptyHint || 'No footer resources yet. Create your first entry above.'}
      </p>
    );
  }

  return (
    <ul className="w-full flex flex-col gap-3">
      {rows.map((row) => {
        const isActive = editingId && String(editingId) === String(row.id);
        return (
          <li
            key={row.id}
            className={`w-full rounded-xl border p-3 flex flex-col gap-2 ${
              isActive
                ? 'border-violet-400/70 bg-violet-500/10'
                : 'border-slate-800 bg-[#111622]'
            }`}
          >
            <div className="w-full flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{rowHeadline(row)}</p>
                <p className="text-[11px] text-slate-200 break-words">{metaLine(row)}</p>
                {row.authorName ? (
                  <p className="text-[11px] text-slate-300 mt-0.5">By {row.authorName}</p>
                ) : null}
                {row.category === 'Careers' && row.content ? (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{row.content}</p>
                ) : null}
                {(row.category === 'Tutorials' || row.category === 'Guides' || row.category === 'Blog' || row.category === 'Case Studies') && row.content ? (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {String(row.content)
                      .replace(/##\s*summary\s*/gi, '')
                      .replace(/##\s*metrics[\s\S]*/gi, '')
                      .replace(/progress\s*[:=]\s*\d{1,3}/gi, '')
                      .trim()}
                  </p>
                ) : null}
                {row.category !== 'Careers' && row.category !== 'Tutorials' && row.category !== 'Guides' && row.category !== 'Blog' && row.category !== 'Case Studies' && row.excerpt ? (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{row.excerpt}</p>
                ) : null}
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className={`text-[11px] font-semibold ${isActive ? 'text-violet-200 underline' : 'text-blue-300'}`}
                >
                  {isActive ? 'Editing' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="text-[11px] font-semibold text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
            <FooterResourceImagePreview imageurl={row.imageurl} alt="" />
          </li>
        );
      })}
    </ul>
  );
}
