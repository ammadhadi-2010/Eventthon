import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alertAvatarInitial, resolveAlertAvatarUrl } from "../utils/alertAvatar";
import { sanitizeAlertCopy } from "../utils/alertMessageCopy";

const toSectionTitle = (section) => {
  if (section === "today") return "Today";
  if (section === "yesterday") return "Yesterday";
  return "Earlier";
};

const toTone = (category) => {
  if (category === "mentions") return "purple";
  if (category === "squad") return "green";
  if (category === "security") return "amber";
  return "blue";
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AlertAvatar = ({ item }) => {
  const [broken, setBroken] = useState(false);
  const url = resolveAlertAvatarUrl(item);
  if (!broken && url && url !== "/default-avatar.png") {
    return (
      <img
        src={url}
        alt=""
        className="alerts-avatar alerts-avatar--img"
        onError={() => setBroken(true)}
      />
    );
  }
  return <div className="alerts-avatar">{(alertAvatarInitial(item))}</div>;
};

const AlertsTimeline = ({ items, onOpenAlert, employerMode = false }) => {
  const navigate = useNavigate();
  const detailBase = employerMode ? '/company/notifications/alerts' : '/notifications/alerts';
  const grouped = items.reduce((acc, item) => {
    const section = item.section || "earlier";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const orderedSections = ["today", "yesterday", "earlier"].filter((key) => grouped[key]?.length);

  if (!orderedSections.length) {
    return (
      <section className="alerts-timeline-wrap">
        <div className="alerts-empty-state">No alerts yet.</div>
      </section>
    );
  }

  return (
    <section className="alerts-timeline-wrap">
      {orderedSections.map((sectionKey) => (
        <div key={sectionKey} className="alerts-timeline-block">
          <h3 className="alerts-timeline-heading">{toSectionTitle(sectionKey)}</h3>

          <div className="alerts-list">
            {grouped[sectionKey].map((item) => (
              <article
                key={item._id || `${item.title}-${item.created_at}`}
                className={`alerts-list-item alerts-list-item--responsive tone-${toTone(item.category)} ${item.is_read ? "" : "is-unread"}`}
                onClick={() => {
                  if (typeof onOpenAlert === "function") onOpenAlert(item);
                  if (item._id) navigate(`${detailBase}/${item._id}`);
                }}
              >
                <AlertAvatar item={item} />
                <div className="alerts-item-content">
                  <p>
                    <strong>{item.title}</strong>
                  </p>
                  <span>
                    {sanitizeAlertCopy(
                      item.message,
                      "Thank you for helping us improve our system design.",
                    )}
                  </span>
                </div>
                <div className="alerts-item-meta">
                  <small>{formatTime(item.created_at)}</small>
                  {!item.is_read ? <span className="alerts-unread-dot" /> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default AlertsTimeline;

