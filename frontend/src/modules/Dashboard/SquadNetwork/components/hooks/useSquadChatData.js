import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadSquadWorkspaceBundle,
  fetchSquadMembers,
  fetchSquadProjectsOnly,
  postSquadMessage,
  putSquadMessage,
  deleteSquadMessage,
  reactSquadMessage,
  leaveSquadApi,
  createSquadProject,
  updateSquadProject,
  deleteSquadProject,
  updateSquadMemberRole,
  removeSquadMember,
  uploadSquadChatFile,
  deleteSquadFile,
} from '../../api/squadWorkspaceApi';
import { enrichSquadMembersWithAvatars } from '../../utils/enrichSquadMembers';

const getSenderName = (userData) => `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`.trim();

export default function useSquadChatData({ squadId, userData, projectsRefreshToken = 0 }) {
  const [message, setMessage] = useState('');
  const [showPinned, setShowPinned] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [activityOverview, setActivityOverview] = useState([]);
  const [topMembers, setTopMembers] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [chatNotice, setChatNotice] = useState('');

  const messagesRef = useRef(chatMessages);
  messagesRef.current = chatMessages;

  const userId = userData?._id || userData?.id;

  const showNotice = useCallback((text) => {
    setChatNotice(text);
    window.setTimeout(() => setChatNotice(''), 2400);
  }, []);

  const patchMessage = useCallback((messageId, next) => {
    setChatMessages((prev) => prev.map((row) => (row.id === messageId ? { ...row, ...next } : row)));
  }, []);

  useEffect(() => {
    if (!squadId) return undefined;
    let cancelled = false;
    setChatLoading(true);
    loadSquadWorkspaceBundle(squadId)
      .then(async (bundle) => {
        if (cancelled) return;
        setChatMessages(bundle.messages);
        const needsAvatars = (bundle.members || []).some(
          (member) => !member?.imageurl && !member?.avatar && !member?.profile_image_url,
        );
        setMembers(
          needsAvatars ? await enrichSquadMembersWithAvatars(bundle.members) : bundle.members,
        );
        setProjects(bundle.projects);
        setFiles(bundle.files);
        setActivity(bundle.activity);
        setActivityFeed(bundle.activityFeed);
        setActivityOverview(bundle.activityOverview);
        setTopMembers(bundle.topMembers);
      })
      .catch((err) => console.error('Squad workspace load failed:', err))
      .finally(() => {
        if (!cancelled) setChatLoading(false);
      });
    return () => { cancelled = true; };
  }, [squadId]);

  useEffect(() => {
    if (!squadId || !projectsRefreshToken) return undefined;
    let cancelled = false;
    fetchSquadProjectsOnly(squadId)
      .then((rows) => { if (!cancelled) setProjects(rows); })
      .catch((err) => console.error('Squad projects refresh failed:', err));
    return () => { cancelled = true; };
  }, [squadId, projectsRefreshToken]);

  const sendMessage = useCallback(async () => {
    const clean = message.trim();
    if (!clean || !squadId) return;
    try {
      if (editingMessage?.id) {
        const res = await putSquadMessage(squadId, editingMessage.id, { text: clean, sender_id: userId });
        if (res?.data) patchMessage(editingMessage.id, res.data);
        setEditingMessage(null);
        setMessage('');
        showNotice('Message updated.');
        return;
      }
      const res = await postSquadMessage(squadId, {
        text: clean,
        sender_name: getSenderName(userData),
        sender_id: userId,
      });
      if (res?.data) setChatMessages((prev) => [...prev, res.data]);
      setMessage('');
    } catch (err) {
      console.error('Send message failed:', err);
      showNotice('Could not send message.');
    }
  }, [message, squadId, userData, userId, editingMessage, patchMessage, showNotice]);

  const actions = useMemo(() => ({
    openInvite: () => setInviteModalOpen(true),
    closeInvite: () => setInviteModalOpen(false),
    setShowPinned,
    setMessage,
    setEditingMessage,
    cancelEdit: () => { setEditingMessage(null); setMessage(''); },
    startEditMessage: (messageId) => {
      const target = messagesRef.current.find((row) => row.id === messageId);
      if (!target?.text) return;
      setEditingMessage({ id: messageId, text: target.text });
      setMessage(target.text);
    },
    sendMessage,
    deleteMessage: async (messageId) => {
      if (!squadId || !messageId) return;
      try {
        await deleteSquadMessage(squadId, messageId, { sender_id: userId });
        setChatMessages((prev) => prev.filter((row) => row.id !== messageId));
        setEditingMessage((cur) => {
          if (cur?.id === messageId) setMessage('');
          return cur?.id === messageId ? null : cur;
        });
        showNotice('Message deleted.');
      } catch (err) {
        console.error('Delete message failed:', err);
        showNotice('Delete failed.');
      }
    },
    shareMessage: async (messageId) => {
      const target = messagesRef.current.find((row) => row.id === messageId);
      const body = target?.text || target?.file_name || '';
      if (!body) return;
      const shareText = `${target?.sender || target?.sender_name || 'Member'}: ${body}`;
      try {
        if (navigator.share) await navigator.share({ text: shareText });
        else { await navigator.clipboard.writeText(shareText); showNotice('Message copied to clipboard.'); }
      } catch { showNotice('Share cancelled.'); }
    },
    reactToMessage: async (messageId, emoji) => {
      if (!squadId || !messageId || !emoji) return;
      try {
        const res = await reactSquadMessage(squadId, messageId, { emoji, sender_id: userId });
        if (res?.data) patchMessage(messageId, res.data);
      } catch (err) {
        console.error('React failed:', err);
        showNotice('Reaction failed.');
      }
    },
    leaveSquad: async () => {
      if (!squadId) return;
      const fullName = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim();
      try {
        await leaveSquadApi(squadId, { user_id: userId, name: fullName || undefined });
        setMembers((prev) => prev.filter((m) => m.id !== userId && m.name !== fullName));
      } catch (err) { console.error('Leave failed:', err); }
    },
    createProject: async (payload) => {
      if (!squadId) return;
      try {
        const res = await createSquadProject(squadId, payload);
        if (res?.status === 'success' && res?.data) setProjects((prev) => [res.data, ...prev]);
      } catch (err) { console.error('Create project failed:', err); }
    },
    updateProject: async (projectId, payload) => {
      if (!squadId || !projectId) return;
      try {
        const res = await updateSquadProject(squadId, projectId, payload);
        if (res?.status === 'success' && res?.data) {
          setProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
        }
      } catch (err) { console.error('Update project failed:', err); }
    },
    syncProject: (updated) => {
      if (!updated?.id) return;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    },
    deleteProject: async (projectId) => {
      if (!squadId || !projectId) return;
      try {
        const res = await deleteSquadProject(squadId, projectId);
        if (res?.status === 'success') setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } catch (err) { console.error('Delete project failed:', err); }
    },
    updateMemberRole: async (memberId, role) => {
      if (!squadId || !memberId || !role) return;
      try {
        const res = await updateSquadMemberRole(squadId, memberId, role);
        if (res?.status === 'success' && res?.data) {
          setMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
        }
      } catch (err) { console.error('Update member role failed:', err); }
    },
    removeMember: async (memberId) => {
      if (!squadId || !memberId) return;
      try {
        const res = await removeSquadMember(squadId, memberId);
        if (res?.status === 'success') setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } catch (err) { console.error('Remove member failed:', err); }
    },
    uploadSquadFile: async (file) => {
      if (!squadId || !file) return null;
      const data = new FormData();
      data.append('file', file);
      data.append('sender_name', getSenderName(userData));
      data.append('sender_id', userId || '');
      try {
        const res = await uploadSquadChatFile(squadId, data);
        if (res?.data) setChatMessages((prev) => [...prev, res.data]);
        if (res?.file) setFiles((prev) => [res.file, ...prev]);
        return res;
      } catch (err) {
        console.error('File upload failed:', err);
        return null;
      }
    },
    deleteSquadFile: async (fileId) => {
      if (!squadId || !fileId) return false;
      try {
        const res = await deleteSquadFile(squadId, fileId);
        if (res?.status === 'success') { setFiles((prev) => prev.filter((f) => f.id !== fileId)); return true; }
      } catch (err) { console.error('Delete file failed:', err); }
      return false;
    },
    refreshMembersAfterInvite: async () => {
      if (!squadId) return;
      try {
        const rows = await fetchSquadMembers(squadId);
        setMembers(await enrichSquadMembersWithAvatars(rows));
      }
      catch (err) { console.error('Refresh members failed:', err); }
    },
  }), [squadId, userData, userId, sendMessage, patchMessage, showNotice, editingMessage]);

  return {
    state: {
      message, editingMessage, chatNotice, showPinned, inviteModalOpen,
      chatMessages, members, projects, files, activity, activityFeed,
      activityOverview, topMembers, loading: chatLoading,
    },
    actions,
  };
}
