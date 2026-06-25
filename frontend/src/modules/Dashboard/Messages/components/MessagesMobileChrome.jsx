import React, { useEffect, useState } from "react";
import { FiEdit2, FiSearch } from "react-icons/fi";
import { readStoredUserStub } from "../../../../utils/storedUser";
import { getAvatarUrl } from "../../Navbar/userMenuUtils";
import MemberHubCompanySwitch from "../../components/mobile/MemberHubCompanySwitch";

const MessagesMobileChrome = ({ isNavVisible = true, query = "", onQueryChange, onNewMessage }) => {
  const user = readStoredUserStub();
  const [avatarSrc, setAvatarSrc] = useState(() => getAvatarUrl(user));
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    setAvatarSrc(getAvatarUrl(user));
  }, [user?.profile_image_url, user?.avatar, user?.profile_image, user?.name, user?.email]);

  const submit = () => {
    onQueryChange?.(draft);
  };

  return (
    <div
      className={`msgx-mobile-chrome${isNavVisible ? "" : " msgx-mobile-chrome--hidden"}`}
      aria-hidden={!isNavVisible}
    >
      <header className="msgx-mobile-topbar" aria-label="Messages mobile header">
        <button type="button" className="msgx-mobile-topbar__avatar-btn" aria-label="Your profile">
          <img
            src={avatarSrc}
            alt=""
            className="msgx-mobile-topbar__avatar"
            onError={() => setAvatarSrc(getAvatarUrl(null))}
          />
        </button>

        <div className="msgx-mobile-topbar__search">
          <FiSearch className="msgx-mobile-topbar__search-icon" aria-hidden />
          <input
            type="search"
            className="msgx-mobile-topbar__search-input"
            placeholder="Search conversations..."
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onQueryChange?.(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label="Search conversations"
          />
        </div>

        <MemberHubCompanySwitch variant="compact" />

        <button
          type="button"
          className="msgx-mobile-topbar__compose-btn"
          onClick={onNewMessage}
          aria-label="New message"
        >
          <FiEdit2 size={18} aria-hidden />
        </button>
      </header>
    </div>
  );
};

export default MessagesMobileChrome;
