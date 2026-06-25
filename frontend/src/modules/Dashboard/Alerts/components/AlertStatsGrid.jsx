import React from "react";
import { Bell, CalendarDays, MessageSquare, Shield } from "lucide-react";

const AlertStatsGrid = ({ stats }) => {
  const alertStats = [
    {
      key: "total",
      title: "Total Alerts",
      value: stats?.total ?? 0,
      detail: "All notifications",
      tone: "purple",
      icon: Bell,
    },
    {
      key: "unread",
      title: "Unread",
      value: stats?.unread ?? 0,
      detail: "Needs attention",
      tone: "blue",
      icon: MessageSquare,
    },
    {
      key: "today",
      title: "Today",
      value: stats?.today ?? 0,
      detail: "Recent alerts",
      tone: "green",
      icon: CalendarDays,
    },
    {
      key: "priority",
      title: "High Priority",
      value: stats?.high_priority ?? 0,
      detail: "Urgent items",
      tone: "amber",
      icon: Shield,
    },
  ];

  return (
    <section className="alerts-stats-grid alerts-stats-lane">
      {alertStats.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.key} className={`alerts-stat-card alerts-stat-card--lane tone-${item.tone}`}>
            <div>
              <p className="alerts-stat-title">{item.title}</p>
              <h3 className="alerts-stat-value">{item.value}</h3>
              <p className="alerts-stat-detail">{item.detail}</p>
            </div>
            <Icon size={18} className="alerts-stat-icon" />
          </article>
        );
      })}
    </section>
  );
};

export default AlertStatsGrid;

