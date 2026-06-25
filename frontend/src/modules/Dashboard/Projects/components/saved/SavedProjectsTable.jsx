import React from 'react';
import OwnerCell from '../collaborations/OwnerCell';
import SavedRowActions from './SavedRowActions';
import ProjectRowMenu from '../shared/ProjectRowMenu';

function ProjectCell({ row }) {
  return (
    <div className="ph-mp-project">
      <span className={`ph-mp-project-icon ph-mp-project-icon--${row.iconTone}`}>
        {row.iconGlyph || row.title.charAt(0)}
      </span>
      <strong className="ph-sv-project-title">{row.title}</strong>
    </div>
  );
}

function SavedMobileCard({ row, onUnsave, buildMenuItems }) {
  return (
    <article className="ph-mp-mobile-card ph-sv-mobile-card">
      <div className="ph-mp-mobile-top">
        <div className="ph-sv-mobile-copy">
          <strong className="ph-mp-mobile-title">{row.title}</strong>
          <span className="ph-sv-mobile-cat">{row.category}</span>
        </div>
        <div className="ph-sv-actions-wrap">
          <SavedRowActions title={row.title} onUnsave={() => onUnsave?.(row)} />
          <ProjectRowMenu
            label={`More options for ${row.title}`}
            items={buildMenuItems?.(row) || []}
          />
        </div>
      </div>
      <div className="ph-mp-mobile-meta">
        <span>{row.savedOn}</span>
        <OwnerCell name={row.ownerName} initials={row.ownerInitials} isYou={false} />
      </div>
    </article>
  );
}

export default function SavedProjectsTable({ rows, onUnsave, buildMenuItems }) {
  return (
    <section className="ph-card ph-mp-table-card ph-sv-table-card">
      <div className="ph-mp-mobile-list" aria-label="Saved projects list">
        {rows.length === 0 ? (
          <p className="ph-table-empty">No saved projects match your search.</p>
        ) : (
          rows.map((row) => (
            <SavedMobileCard
              key={row.id}
              row={row}
              onUnsave={onUnsave}
              buildMenuItems={buildMenuItems}
            />
          ))
        )}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table ph-mp-table ph-sv-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Saved On</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="ph-table-empty">
                  No saved projects match your search.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="ph-mp-row">
                  <td>
                    <ProjectCell row={row} />
                  </td>
                  <td className="ph-sv-date">{row.savedOn}</td>
                  <td className="ph-sv-category">{row.category}</td>
                  <td>
                    <OwnerCell name={row.ownerName} initials={row.ownerInitials} isYou={false} />
                  </td>
                  <td>
                    <div className="ph-sv-actions-wrap">
                      <SavedRowActions title={row.title} onUnsave={() => onUnsave?.(row)} />
                      <ProjectRowMenu
                        label={`More options for ${row.title}`}
                        items={buildMenuItems?.(row) || []}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
