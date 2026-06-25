import React, { useState } from 'react';
import { FiBriefcase, FiPlus, FiCheck, FiX, FiTrash2, FiCalendar } from 'react-icons/fi';

const Experience = ({ userData, onChange, isModalMode = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const experiences = userData.experiences || [];

  const [newExp, setNewExp] = useState({ 
    role: '', company: '', period: '', desc: '', tags: '', location: 'Remote' 
  });

  const handleAdd = () => {
    if (!newExp.role || !newExp.company) return alert("Role and Company are required!");
    const expToAdd = {
      id: Date.now().toString(),
      ...newExp,
      tags: newExp.tags ? newExp.tags.split(',').map(t => t.trim()) : []
    };
    onChange({ experiences: [expToAdd, ...experiences] });
    setNewExp({ role: '', company: '', period: '', desc: '', tags: '', location: 'Remote' });
    setShowAddForm(false);
  };

  return (
    <div style={sectionCard}>
      {/* Header */}
      <div style={sectionHeader}>
        <div style={titleGroup}>
          <div style={iconCircle}><FiBriefcase size={20} /></div>
          <h3 style={sectionTitle}>Work Experience</h3>
        </div>
        <button 
          style={showAddForm ? cancelBtn : addBtn} 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <FiX size={18}/> : <FiPlus size={18}/>}
        </button>
      </div>

      {/* --- ADD FORM (Exactly like your Screenshot) --- */}
      {showAddForm && (
        <div style={addFormStyle}>
          <div style={inputRow}>
            <input style={miniInput} placeholder="Job Role" value={newExp.role} onChange={(e) => setNewExp({...newExp, role: e.target.value})} />
            <input style={miniInput} placeholder="Company Name" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} />
          </div>
          <div style={inputRow}>
            <input style={miniInput} placeholder="Period (e.g. Jan 2024 - Present)" value={newExp.period} onChange={(e) => setNewExp({...newExp, period: e.target.value})} />
            <input style={miniInput} placeholder="Location" value={newExp.location} onChange={(e) => setNewExp({...newExp, location: e.target.value})} />
          </div>
          <textarea style={miniTextArea} placeholder="Briefly describe your responsibilities..." value={newExp.desc} onChange={(e) => setNewExp({...newExp, desc: e.target.value})} />
          <input style={miniInput} placeholder="Skills (comma separated)" value={newExp.tags} onChange={(e) => setNewExp({...newExp, tags: e.target.value})} />
          <button style={submitBtn} onClick={handleAdd}>
            <FiCheck /> Save to Profile
          </button>
        </div>
      )}

      {/* --- LIST (Timeline Style) --- */}
      <div style={timelineWrapper}>
        {experiences.map((exp, index) => (
          <div key={exp.id} style={timelineItem}>
            <div style={lineWrapper}>
              <div style={dot}></div>
              {index !== experiences.length - 1 && <div style={verticalLine}></div>}
            </div>
            <div style={expBody}>
              <div style={expHeader}>
                <div>
                  <h4 style={roleText}>{exp.role}</h4>
                  <p style={companyText}>{exp.company} • {exp.location}</p>
                </div>
                <button onClick={() => onChange({experiences: experiences.filter(e => e.id !== exp.id)})} style={deleteBtn}>
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div style={dateBadge}><FiCalendar size={10} /> {exp.period}</div>
              <p style={descText}>{exp.desc}</p>
              <div style={tagList}>
                {exp.tags?.map(tag => <span key={tag} style={skillTag}>{tag}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES (Your Original Working Styles) ---
const sectionCard = { background: '#0f172a', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const titleGroup = { display: 'flex', alignItems: 'center', gap: '15px' };
const iconCircle = { width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' };
const sectionTitle = { fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 };
const addBtn = { background: '#3b82f6', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cancelBtn = { ...addBtn, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
const deleteBtn = { background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' };
const addFormStyle = { background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', padding: '20px', borderRadius: '20px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' };
const inputRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const miniInput = { background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '13px' };
const miniTextArea = { ...miniInput, height: '80px', resize: 'none' };
const submitBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' };
const timelineWrapper = { display: 'flex', flexDirection: 'column' };
const timelineItem = { display: 'flex', gap: '20px' };
const lineWrapper = { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' };
const dot = { width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', border: '3px solid #0f172a', marginTop: '6px' };
const verticalLine = { width: '2px', flex: 1, background: '#1e293b', margin: '4px 0' };
const expBody = { flex: 1, paddingBottom: '35px' };
const expHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const roleText = { fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 };
const companyText = { fontSize: '13px', color: '#94a3b8', margin: '4px 0' };
const dateBadge = { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', margin: '10px 0', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' };
const descText = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 12px 0' };
const tagList = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const skillTag = { fontSize: '11px', fontWeight: '600', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' };

export default Experience;