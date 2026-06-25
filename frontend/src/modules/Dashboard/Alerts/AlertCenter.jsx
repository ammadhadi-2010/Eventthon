import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./AlertCenter.css";
import "./alert-center-mobile.css";
import "./alert-center-mobile-toolbar.css";
import "./alert-center-mobile-sheets.css";
import "./alert-center-mobile-drawer.css";
import "./alert-center-mobile-topbar.css";
import AlertNavSidebar from "./components/AlertNavSidebar";
import AlertsHeader from "./components/AlertsHeader";
import AlertStatsGrid from "./components/AlertStatsGrid";
import AlertsTimeline from "./components/AlertsTimeline";
import AlertRightSidebar from "./components/AlertRightSidebar";
import AlertsMobileChrome from "./components/AlertsMobileChrome";
import AlertsMobileFilterSheet from "./components/AlertsMobileFilterSheet";
import { useAlertCenterData } from "./hooks/useAlertCenterData";
import { useAlertCenterScrollChrome } from "./hooks/useAlertCenterScrollChrome";
import { buildDisplayAlerts, toggleListSelection } from "./utils/alertCenterFilters";

const AlertCenter = ({ userData: userDataProp, employerMode = false }) => {
  const {
    stats,
    alerts,
    categories,
    loading,
    marking,
    handleMarkAllRead,
    handleOpenAlert,
  } = useAlertCenterData({ userDataProp, employerMode });

  const { isVisible } = useAlertCenterScrollChrome();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openLeftDrawer = useCallback(() => setLeftDrawerOpen(true), []);
  const closeLeftDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  useEffect(() => {
    if (!leftDrawerOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [leftDrawerOpen]);

  const handleQuickAction = (actionKey) => {
    if (actionKey === "pause") {
      setStatusText("Do Not Disturb enabled for this session.");
      return;
    }
    if (actionKey === "history") {
      setActiveCategory("all");
      setStatusText("Showing full alert history.");
      return;
    }
    if (actionKey === "settings") {
      setStatusText("Notification settings panel synced.");
      return;
    }
    if (actionKey === "support") {
      setStatusText("Support request shortcut is ready.");
    }
  };

  const handleApplyFilters = () => setStatusText("Filters applied.");
  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setOnlyUnread(false);
    setStatusText("Filters cleared.");
  };

  const displayAlerts = useMemo(
    () =>
      buildDisplayAlerts({
        alerts,
        activeCategory,
        onlyUnread,
        selectedTypes,
        selectedPriorities,
        searchQuery,
      }),
    [alerts, activeCategory, onlyUnread, selectedTypes, selectedPriorities, searchQuery],
  );

  const enhancedCategories = (categories || []).map((c) => ({
    ...c,
    active: c.key === activeCategory,
  }));

  const filterProps = {
    selectedTypes,
    selectedPriorities,
    onToggleType: (value) => setSelectedTypes((prev) => toggleListSelection(prev, value)),
    onTogglePriority: (value) => setSelectedPriorities((prev) => toggleListSelection(prev, value)),
    onApplyFilters: handleApplyFilters,
    onClearFilters: handleClearFilters,
  };

  const shellClass = `alerts-page-shell alerts-mobile-shell${
    employerMode ? " alerts-mobile-shell--company" : ""
  }`;

  return (
    <div className={shellClass}>
      {!employerMode ? (
        <AlertsMobileChrome
          isVisible={isVisible}
          onOpenLeftDrawer={openLeftDrawer}
          onMarkAllRead={handleMarkAllRead}
          marking={marking}
          onOpenFilters={() => setFilterSheetOpen(true)}
          onQuickAction={handleQuickAction}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      ) : (
        <AlertsMobileChrome
          toolbarOnly
          isVisible
          onOpenLeftDrawer={openLeftDrawer}
          onMarkAllRead={handleMarkAllRead}
          marking={marking}
          onOpenFilters={() => setFilterSheetOpen(true)}
          onQuickAction={handleQuickAction}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      )}

      {leftDrawerOpen ? (
        <button
          type="button"
          className="alerts-left-drawer-backdrop is-visible"
          aria-label="Close alert categories menu"
          onClick={closeLeftDrawer}
        />
      ) : null}

      <div className={`alerts-left-rail${leftDrawerOpen ? " is-drawer-open" : ""}`}>
        <AlertNavSidebar
          categories={enhancedCategories}
          activeCategory={activeCategory}
          onCategorySelect={(key) => {
            setActiveCategory(key);
            closeLeftDrawer();
          }}
          onManagePreferences={() => setStatusText("Preferences panel is ready.")}
        />
      </div>

      <main className="alerts-main-content">
        <div className="alerts-mobile-feed">
          <AlertsHeader onMarkAllRead={handleMarkAllRead} busy={marking} />
          <AlertStatsGrid stats={stats} />
          {statusText ? <div className="alerts-loading">{statusText}</div> : null}
          {loading ? (
            <div className="alerts-loading">Loading alerts...</div>
          ) : (
            <AlertsTimeline
              items={displayAlerts}
              onOpenAlert={handleOpenAlert}
              employerMode={employerMode}
            />
          )}
        </div>
      </main>

      <AlertRightSidebar {...filterProps} onQuickAction={handleQuickAction} />

      <AlertsMobileFilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} {...filterProps} />
    </div>
  );
};

export default AlertCenter;
