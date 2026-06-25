import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { getAvatarUrl } from '../../../Navbar/userMenuUtils';

function inviteAvatarSrc(user) {
  return getAvatarUrl({
    name: user?.name,
    email: user?.email,
    profile_image_url: user?.profile_image_url || user?.avatar || user?.imageurl || user?.profile_image,
  });
}

export default function CreateSquadInviteSection({ users, form, search, onSearch, onToggleUser }) {
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.name, u.title, u.handle].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [users, search]);

  return (
    <section className="cs-section">
      <header className="cs-section__head">
        <span className="cs-section__num">4</span>
        <div>
          <h3>Invite Members</h3>
          <p>Optional — select teammates to invite now.</p>
        </div>
      </header>

      <div className="cs-search">
        <Search size={16} aria-hidden />
        <input
          type="search"
          placeholder="Search users to invite..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <ul className="cs-invite-list">
        {filtered.map((user) => {
          const selected = form.invitedUserIds.includes(user._id);
          return (
            <li key={user._id}>
              <label className={`cs-invite-row${selected ? ' is-selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleUser(user._id)}
                />
                <img
                  src={inviteAvatarSrc(user)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getAvatarUrl(null);
                  }}
                />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.handle || user.title || 'Member'}</span>
                </div>
                <em>{user.role || 'Member'}</em>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
