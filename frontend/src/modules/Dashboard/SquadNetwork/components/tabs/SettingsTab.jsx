import React, { useEffect, useMemo, useState } from 'react';
import API from '../../../../../api/axiosConfig';
import { getSquadsSessionHeaders } from '../../services/squadsSession';
import { INITIAL_TOGGLES, LEFT_MENU, MENU_META, MENU_SETTING_ITEMS, SETTINGS_ITEMS } from './settings/config';
import SettingsPanelCard from './settings/SettingsPanelCard';
import SquadInfoCard from './settings/SquadInfoCard';
import { styles } from './settings/styles';
import '../../styles/squad-settings-mobile.css';

const SettingsTab = ({ selectedSquad, members = [], onEditSquad }) => {
  const [activeMenu, setActiveMenu] = useState('info');
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [form, setForm] = useState({
    squad_name: '',
    niche: '',
    description: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const owner = useMemo(() => members.find((m) => String(m.role || '').toLowerCase() === 'admin') || members[0], [members]);
  const squadName = selectedSquad?.squad_name || 'SEO Masters';
  const squadNiche = selectedSquad?.niche || 'SEO & Marketing Squad';
  const squadDesc = selectedSquad?.description || 'A squad for SEO experts and marketers to share knowledge, strategies and grow together.';
  const squadId = selectedSquad?._id ? `#${String(selectedSquad._id).toUpperCase()}` : '#SEO124';
  const createdOn = useMemo(() => {
    const raw = selectedSquad?.created_at;
    if (!raw) return 'Jan 15, 2024';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Jan 15, 2024';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedSquad?.created_at]);
  const menuMeta = MENU_META[activeMenu] || MENU_META.info;
  const activeSettings = MENU_SETTING_ITEMS[activeMenu] || SETTINGS_ITEMS;
  const isPublic = toggles.publicListing !== false;

  useEffect(() => {
    setForm({
      squad_name: selectedSquad?.squad_name || 'SEO Masters',
      niche: selectedSquad?.niche || 'SEO & Marketing Squad',
      description: selectedSquad?.description || 'A squad for SEO experts and marketers to share knowledge, strategies and grow together.',
    });
  }, [selectedSquad?.squad_name, selectedSquad?.niche, selectedSquad?.description]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!selectedSquad?._id) return;
      try {
        const res = await API.get(`/squads/${selectedSquad._id}/settings`, {
          headers: getSquadsSessionHeaders(),
        });
        if (res?.data?.status === 'success' && res?.data?.data) {
          setToggles((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Load squad settings failed:', err);
      }
    };
    loadSettings();
  }, [selectedSquad?._id]);

  const persistSettings = async (nextToggles) => {
    if (!selectedSquad?._id) return;
    setSavingSettings(true);
    setSettingsMessage('Saving...');
    try {
      const res = await API.put(`/squads/${selectedSquad._id}/settings`, { settings: nextToggles }, {
        headers: getSquadsSessionHeaders(),
      });
      if (res?.data?.status === 'success') {
        setSettingsMessage('Settings synced with backend');
      } else {
        setSettingsMessage('Could not sync settings');
      }
    } catch (err) {
      console.error('Save squad settings failed:', err);
      setSettingsMessage('Save failed, please retry');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = (key) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistSettings(next);
      return next;
    });
  };

  return (
    <div className="sq-settings-tab" style={styles.wrap}>
      <div className="sq-settings-nav" style={styles.leftPanel}>
        {LEFT_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sq-settings-nav-item${activeMenu === item.id ? ' is-active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
            style={styles.leftItem(activeMenu === item.id)}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="sq-settings-content" style={styles.rightPanel}>
        <SquadInfoCard
          form={form}
          squadName={squadName}
          squadNiche={squadNiche}
          squadDesc={squadDesc}
          owner={owner}
          createdOn={createdOn}
          squadId={squadId}
          isPublic={isPublic}
          onOpenEdit={() => onEditSquad?.()}
        />
        <SettingsPanelCard
          menuMeta={menuMeta}
          activeSettings={activeSettings}
          toggles={toggles}
          onToggle={handleToggle}
          footerText={savingSettings ? 'Syncing with backend...' : settingsMessage || undefined}
        />
      </div>
    </div>
  );
};

export default SettingsTab;
