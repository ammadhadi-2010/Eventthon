import { useCallback, useMemo, useState } from 'react';
import { MY_PROJECTS_ROWS, TABLE_TABS } from '../data/projectsHubData';

export default function useProjectsHubState({ tableRows, tableTabs, initialMenu } = {}) {
  const [activeMenu, setActiveMenu] = useState(initialMenu || 'overview');
  const [tableTab, setTableTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const rowsSource = tableRows ?? MY_PROJECTS_ROWS;
  const tabsSource = tableTabs ?? TABLE_TABS;

  const filteredRows = useMemo(() => {
    let rows = rowsSource;
    if (tableTab === 'in-progress') {
      rows = rows.filter((r) => r.status === 'in-progress' || r.status === 'in-review');
    } else if (tableTab === 'completed') rows = rows.filter((r) => r.status === 'completed');
    else if (tableTab === 'on-hold') rows = rows.filter((r) => r.status === 'on-hold');

    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || r.title || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q),
    );
  }, [tableTab, searchQuery, rowsSource]);

  const openNewProject = useCallback(() => setActiveMenu('create-project'), []);
  const cancelCreateProject = useCallback(() => setActiveMenu('overview'), []);
  const openAnalytics = useCallback(() => setShowAnalytics(true), []);
  const closeAnalytics = useCallback(() => setShowAnalytics(false), []);

  return {
    activeMenu,
    setActiveMenu,
    tableTab,
    setTableTab,
    searchQuery,
    setSearchQuery,
    filteredRows,
    tableTabs: tabsSource,
    showAnalytics,
    openNewProject,
    cancelCreateProject,
    openAnalytics,
    closeAnalytics,
  };
}
