import React from 'react';
import { X, Shield, User, Mail, Smartphone, Calendar, Briefcase, Image as ImageIcon, ExternalLink } from 'lucide-react';

const UserReviewModal = ({ user, onClose, onAction, viewMode }) => {
  if (!user) return null;

  // Global URL Helper (Backend images handle karne ke liye)
  const BASE_URL = "http://127.0.0.1:8000";
  const getFullUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
      <div className="bg-[#0f172a] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] custom-scrollbar">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#0f172a]/90 backdrop-blur-md p-8 flex justify-between items-center border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
              <Shield className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter">
                MISSION DEBRIEF: <span className="text-blue-500">{user.first_name || 'UNKNOWN'}</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Data Key: {user.mobile}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/10">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Side: Personnel Profile */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Personnel Data</h3>
              </div>
              
              <div className="space-y-4 bg-white/[0.02] p-6 rounded-[24px] border border-white/5">
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><User size={14} className="text-blue-400"/></div>
                  <span className="font-bold">{user.first_name} {user.last_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Mail size={14} className="text-blue-400"/></div>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Smartphone size={14} className="text-blue-400"/></div>
                  <span className="font-mono text-blue-300">{user.mobile}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Calendar size={14} className="text-blue-400"/></div>
                  <span className="uppercase text-[11px] font-black tracking-wider text-slate-400">DOB: {user.birth_day || '??'}/{user.birth_month || '??'}</span>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Role</h3>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[24px]">
                <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-widest mb-3">
                  <Briefcase size={16}/> {user.niche || 'Special Agent'}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                  "{user.bio || 'No tactical bio provided by the operative.'}"
                </p>
              </div>
            </section>
          </div>

          {/* Right Side: Identity Authentication */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
              <h3 className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em]">Identity Authentication</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[ 
                {label: 'Front Side (Primary)', src: getFullUrl(user.id_front)}, 
                {label: 'Rear Side (Validation)', src: getFullUrl(user.id_back)} 
              ].map((img, i) => (
                <div key={i} className="group relative rounded-3xl overflow-hidden bg-black/40 border border-white/5 aspect-video hover:border-blue-500/50 transition-all duration-500 shadow-inner">
                  {img.src ? (
                    <>
                      <img src={img.src} alt={img.label} className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <button onClick={() => window.open(img.src)} className="flex items-center gap-2 text-[10px] font-black text-white bg-blue-600 px-4 py-2 rounded-full shadow-xl">
                          ENLARGE DOCUMENT <ExternalLink size={12}/>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                      <ImageIcon size={40} className="mb-2 opacity-20" />
                      <span className="text-[10px] font-black tracking-tighter opacity-40 uppercase">Awaiting Document Upload</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer: High-Stakes Actions */}
        <div className="p-8 pt-0 flex gap-4">
          {viewMode === 'pending' ? (
            <>
              <button 
                onClick={() => onAction(user.mobile, 'approve')} 
                className="flex-[2] bg-blue-600 hover:bg-blue-500 py-5 rounded-[20px] text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
              >
                AUTHORIZE OPERATIVE
              </button>
              <button 
                onClick={() => onAction(user.mobile, 'reject')} 
                className="flex-1 bg-red-600/10 hover:bg-red-600 hover:text-white py-5 rounded-[20px] text-[11px] font-black text-red-500 transition-all border border-red-500/20 uppercase tracking-[0.2em]"
              >
                REJECT
              </button>
            </>
          ) : (
            <button 
              onClick={() => onAction(user.mobile, 'reject')} 
              className="w-full bg-red-600/5 hover:bg-red-600/20 py-5 rounded-[20px] text-[11px] font-black text-red-400 transition-all border border-red-500/10 uppercase tracking-[0.2em]"
            >
              REVOKE VERIFICATION ACCESS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviewModal;