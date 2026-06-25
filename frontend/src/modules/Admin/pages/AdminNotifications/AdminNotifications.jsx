import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../Dashboard/Alerts/AlertCenter.css';
import AlertNavSidebar from '../../../Dashboard/Alerts/components/AlertNavSidebar';
import AlertsHeader from '../../../Dashboard/Alerts/components/AlertsHeader';
import AlertStatsGrid from '../../../Dashboard/Alerts/components/AlertStatsGrid';
import AlertRightSidebar from '../../../Dashboard/Alerts/components/AlertRightSidebar';
import AdminAlertsTimeline from './AdminAlertsTimeline';
import useAdminAlerts from './useAdminAlerts';
import './adminNotificationsShell.css';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const state = useAdminAlerts();

  const handleQuickAction = (actionKey) => {
    if (actionKey === 'pause') {
      state.setStatusText('Do Not Disturb enabled for this admin session.');
      return;
    }
    if (actionKey === 'history') {
      state.setActiveCategory('all');
      state.setStatusText('Showing full enterprise alert history.');
      return;
    }
    if (actionKey === 'settings') {
      state.setStatusText('Admin notification routing synced.');
      return;
    }
    if (actionKey === 'support') {
      state.setStatusText('Support log shortcut is ready.');
    }
  };

  return (
    <div className="admin-alerts-shell alerts-page-shell">
      <AlertNavSidebar
        categories={state.enhancedCategories}
        activeCategory={state.activeCategory}
        onCategorySelect={state.setActiveCategory}
        onManagePreferences={() => state.setStatusText('Admin alert preferences are active.')}
        extraNavItems={[
          {
            key: 'bug-reports',
            label: '🐞 User Bug Reports',
            onClick: () => navigate('/admin-control/bug-reports'),
          },
        ]}
      />

      <main className="alerts-main-content">
        <AlertsHeader onMarkAllRead={state.handleMarkAllRead} busy={state.marking} />
        <AlertStatsGrid stats={state.stats} />
        {state.statusText ? <div className="alerts-loading">{state.statusText}</div> : null}
        {state.loading ? (
          <div className="alerts-loading">Loading admin alerts...</div>
        ) : (
          <AdminAlertsTimeline items={state.filteredAlerts} onOpenAlert={state.handleOpenAlert} />
        )}
      </main>

      <AlertRightSidebar
        selectedTypes={state.selectedTypes}
        selectedPriorities={state.selectedPriorities}
        onToggleType={(value) => state.setSelectedTypes((prev) => state.toggleListSelection(prev, value))}
        onTogglePriority={(value) =>
          state.setSelectedPriorities((prev) => state.toggleListSelection(prev, value))
        }
        onApplyFilters={() => state.setStatusText('Enterprise filters applied.')}
        onClearFilters={() => {
          state.setSelectedTypes([]);
          state.setSelectedPriorities([]);
          state.setOnlyUnread(false);
          state.setStatusText('Filters cleared.');
        }}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
}
