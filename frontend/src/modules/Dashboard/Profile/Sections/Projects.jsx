import React, { useState, useRef } from 'react';
import { FiLayers, FiPlus, FiCheck, FiX, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { updateProfileProjects, uploadProjectImage } from '../services/profileService';
import { getProfileIdentifier } from '../utils/profileSession';
import { validateProfileImageFile } from '../utils/profileMedia';

const Projects = ({ userData, onChange, isModalMode = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const projects = Array.isArray(userData?.projects) ? userData.projects : [];
  
  const [newProject, setNewProject] = useState({ 
    title: '', 
    desc: '', 
    tech: '', 
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' 
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const validation = validateProfileImageFile(file);
    if (validation) {
      alert(validation);
      return;
    }
    const identifier = getProfileIdentifier(userData);
    if (!identifier) {
      alert('You must be logged in to upload images.');
      return;
    }
    try {
      setUploading(true);
      const res = await uploadProjectImage(file, identifier);
      setNewProject({ ...newProject, image: res.url });
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Upload failed';
      alert(typeof detail === 'string' ? detail : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddProject = async () => { // 👈 async add kiya
  if (!newProject.title) return alert("Title is required!");
  
  const projectToAdd = {
    id: Date.now().toString(),
    ...newProject,
    tech: newProject.tech ? newProject.tech.split(',').map(t => t.trim()) : []
  };

  const updatedProjects = [projectToAdd, ...projects];

  try {
    const identifier = getProfileIdentifier(userData);
    if (identifier) {
      await updateProfileProjects(identifier, updatedProjects);
    }

    if (typeof onChange === 'function') {
      onChange({ projects: updatedProjects });
    }
    
    // ✅ Reset sirf Success ke andar hona chahiye
    setNewProject({ title: '', desc: '', tech: '', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' });
    setShowAddForm(false);

  } catch (err) {
    console.error("❌ Save Error:", err);
    alert("The project could not sleep!");
  }


  setNewProject({ title: '', desc: '', tech: '', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' });
  setShowAddForm(false);
};

  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div style={titleGroup}>
          <div style={iconCircle}><FiLayers size={20} /></div>
          <h3 style={sectionTitle}>Projects Portfolio</h3>
        </div>
        <button 
          style={showAddForm ? cancelBtn : addBtn} 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <FiX size={18}/> : <FiPlus size={18}/>}
        </button>
      </div>

      {showAddForm && (
        <div style={addFormStyle}>
          {/* Image Upload Area */}
          <div style={uploadContainer} onClick={() => fileInputRef.current.click()}>
            <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
            {uploading ? (
              <p style={uploadText}>Uploading...</p>
            ) : (
              <>
                <img 
  src={newProject.image.startsWith('http') ? newProject.image : `http://localhost:8000${newProject.image}`} 
  style={uploadPreview} 
  alt="Preview" 
/>
                <div style={uploadOverlay}><FiUploadCloud size={20}/> Upload Cover</div>
              </>
            )}
          </div>

          <input style={miniInput} placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
          <input style={miniInput} placeholder="Tech Stack (React, Node)" value={newProject.tech} onChange={e => setNewProject({...newProject, tech: e.target.value})} />
          <textarea style={miniTextArea} placeholder="Describe your project work..." value={newProject.desc} onChange={e => setNewProject({...newProject, desc: e.target.value})} />
          
          <button style={submitBtn} onClick={handleAddProject} disabled={uploading}>
            <FiCheck /> Confirm Add Project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      <div style={isModalMode ? modalProjectsGrid : projectsGrid}>
        {projects.map((proj) => (
          <div key={proj.id} style={projectCard} className="group">
            <div style={imageWrapper}>
              <img 
  src={proj.image.startsWith('http') ? proj.image : `http://localhost:8000${proj.image}`} 
  alt={proj.title} 
  style={projectImg} 
  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
/>
              <button onClick={() => onChange({projects: projects.filter(p => p.id !== proj.id)})} style={deleteBtn}>
                <FiTrash2 size={14} />
              </button>
            </div>
            <div style={projectDetails}>
              <h4 style={projTitle}>{proj.title}</h4>
              <p style={projDesc}>{proj.desc}</p>
              <div style={techStack}>
                {proj.tech?.map(t => <span key={t} style={techBadge}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES (Synchronized with Experience.jsx) ---
const sectionCard = { background: '#0f172a', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const titleGroup = { display: 'flex', alignItems: 'center', gap: '15px' };
const iconCircle = { width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' };
const sectionTitle = { fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 };

const addBtn = { background: '#3b82f6', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cancelBtn = { ...addBtn, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };

const addFormStyle = { background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', padding: '20px', borderRadius: '20px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' };
const miniInput = { background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '13px' };
const miniTextArea = { ...miniInput, height: '80px', resize: 'none' };
const submitBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' };

const uploadContainer = { width: '100%', height: '140px', background: '#020617', borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: '2px dashed #1e293b' };
const uploadPreview = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 };
const uploadOverlay = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' };
const uploadText = { textAlign: 'center', lineHeight: '140px', color: '#3b82f6', fontSize: '13px' };

const projectsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const modalProjectsGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '15px' };

const projectCard = { background: '#020617', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1e293b' };
const imageWrapper = { height: '160px', position: 'relative', overflow: 'hidden' };
const projectImg = { width: '100%', height: '100%', objectFit: 'cover' };
const deleteBtn = { position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' };

const projectDetails = { padding: '20px' };
const projTitle = { fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' };
const projDesc = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 15px 0' };
const techStack = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const techBadge = { fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' };

export default Projects;