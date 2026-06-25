import React from 'react';
import { StarRating } from '../../../../../components/reviews';
import { avatarUrl } from '../../data/topCollaboratorsData';

function RankBadge({ rank }) {
  if (rank === 1) return <span className="ph-col-rank ph-col-rank--gold" aria-label="Rank 1">🥇</span>;
  if (rank === 2) return <span className="ph-col-rank ph-col-rank--silver" aria-label="Rank 2">🥈</span>;
  if (rank === 3) return <span className="ph-col-rank ph-col-rank--bronze" aria-label="Rank 3">🥉</span>;
  return <span className="ph-col-rank ph-col-rank--num">{rank}</span>;
}

function CollaboratorMobileCard({ person, rank }) {
  return (
    <article className="ph-col-mobile-card">
      <div className="ph-col-mobile-top">
        <RankBadge rank={rank} />
        <div className="ph-col-person">
          <img src={avatarUrl(person.name)} alt="" className="ph-col-av" />
          <div>
            <strong>{person.name}</strong>
            <span>{person.title}</span>
          </div>
        </div>
      </div>
      <div className="ph-col-mobile-stats">
        <div>
          <span>Projects</span>
          <strong>{person.projects}</strong>
        </div>
        <div>
          <span>Contributions</span>
          <strong>{person.contributions}</strong>
        </div>
      </div>
      <div className="ph-col-impact">
        <div className="ph-col-impact-track">
          <div className="ph-col-impact-fill" style={{ width: `${person.impact}%` }} />
        </div>
        <span>{person.impact}%</span>
      </div>
      <div className="ph-col-rating">
        <StarRating rating={person.rating} iconSize={12} />
        <span>{person.rating.toFixed(1)}</span>
      </div>
    </article>
  );
}

export default function CollaboratorsTable({ rows, startRank = 1 }) {
  if (!rows.length) {
    return (
      <div className="ph-col-empty" role="status">
        No collaborators match this filter.
      </div>
    );
  }

  return (
    <>
      <div className="ph-col-mobile-list" aria-label="Top collaborators list">
        {rows.map((person, index) => (
          <CollaboratorMobileCard key={person.id} person={person} rank={startRank + index} />
        ))}
      </div>
      <div className="ph-col-table-wrap">
        <table className="ph-col-table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Collaborator</th>
              <th scope="col">Projects</th>
              <th scope="col">Contributions</th>
              <th scope="col">Impact Score</th>
              <th scope="col">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person, index) => {
              const rank = startRank + index;
              return (
                <tr key={person.id}>
                  <td>
                    <RankBadge rank={rank} />
                  </td>
                  <td>
                    <div className="ph-col-person">
                      <img src={avatarUrl(person.name)} alt="" className="ph-col-av" />
                      <div>
                        <strong>{person.name}</strong>
                        <span>{person.title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="ph-col-num">{person.projects}</td>
                  <td className="ph-col-num">{person.contributions}</td>
                  <td>
                    <div className="ph-col-impact">
                      <div className="ph-col-impact-track">
                        <div className="ph-col-impact-fill" style={{ width: `${person.impact}%` }} />
                      </div>
                      <span>{person.impact}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="ph-col-rating">
                      <StarRating rating={person.rating} iconSize={12} />
                      <span>{person.rating.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
