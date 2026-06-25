import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import { getUserDisplayName, pickImageurl, resolveDashboardMediaUrl } from '../utils/dashboardMedia';

const ProfileCard = ({ userData }) => {
  const navigate = useNavigate();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const displayName = getUserDisplayName(userData);
  const avatarSrc = resolveDashboardMediaUrl(pickImageurl(userData));
  const bannerSrc = resolveDashboardMediaUrl(pickImageurl({ imageurl: userData?.banner }));
  const showAvatarImage = Boolean(avatarSrc) && !avatarBroken;

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarSrc]);

  return (
    <div className="group relative w-full max-w-[280px] rounded-[32px] overflow-hidden backdrop-blur-3xl saturate-150 bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
      <div className="h-20 relative overflow-hidden">
        {bannerSrc ? (
          <img src={bannerSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt="" />
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-900 to-blue-600 opacity-90" />
        )}
      </div>

      <div className="flex justify-center -mt-10 relative px-4">
        <div className="relative w-20 h-20 rounded-full bg-[#020617] border-4 border-[#020617] flex items-center justify-center text-3xl font-black text-white shadow-2xl overflow-hidden">
          {showAvatarImage ? (
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <span className="text-blue-400">{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {(userData?.identity_status === 'Active' || userData?.verified || userData?.is_verified) && (
          <div className="absolute bottom-1 right-[35%] bg-emerald-500 text-white rounded-full p-1 border-2 border-[#020617]">
            <FiCheckCircle size={12} />
          </div>
        )}
      </div>

      <div className="p-6 pt-4 text-center">
        <h3 className="text-lg font-black text-white tracking-tight leading-tight">{displayName}</h3>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {userData?.headline || userData?.designation || 'Member'}
        </p>
        <div className="grid grid-cols-2 text-center border-t border-[#1e293b] pt-3 mt-3 mb-5">
          <div>
            <span className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">
              JSS Score
            </span>
            <span className="block text-sm font-black text-blue-400 mt-1">
              {userData?.jss_score ?? userData?.jss ?? '100'}%
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">
              Experience
            </span>
            <span className="block text-sm font-black text-blue-400 mt-1">
              {userData?.experience || '0'} Yrs
            </span>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
          onClick={() => navigate('/profile')}
        >
          VIEW PROFILE <FiExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
