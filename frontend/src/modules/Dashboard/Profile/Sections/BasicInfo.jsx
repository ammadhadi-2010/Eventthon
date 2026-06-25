import React from 'react';
import { FiUser, FiMapPin, FiPhone, FiBookOpen, FiGlobe, FiMap } from 'react-icons/fi';

const BasicInfo = ({ userData, onChange }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ [name]: value });
    };

    return (
        <div className="space-y-8 p-1 animate-in fade-in duration-500">
            {/* 1. Full Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">First Name*</label>
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input 
                            name="first_name" 
                            value={userData.first_name || ''} 
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all font-medium" 
                            placeholder="e.g. Ammad" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Last Name*</label>
                    <input 
                        name="last_name" 
                        value={userData.last_name || ''} 
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-blue-500 outline-none transition-all font-medium" 
                        placeholder="e.g. S." 
                    />
                </div>
            </div>

            {/* 2. Professional Identity */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Professional Headline*</label>
                <textarea 
                    name="headline" 
                    value={userData.headline || ''} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 text-white focus:border-blue-500 outline-none transition-all font-medium h-20 resize-none" 
                    placeholder="e.g. Full Stack Developer | AI Automation Expert"
                />
            </div>

            {/* 3. Global Location Settings */}
            <div className="p-6 rounded-[32px] bg-blue-500/5 border border-blue-500/10 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <FiGlobe className="text-blue-500" />
                    <span className="text-xs font-black text-white uppercase tracking-tighter">Global Presence</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country */}
                    <div className="relative">
                        <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            name="country" 
                            value={userData.country || ''} 
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 text-sm text-white focus:border-blue-500" 
                            placeholder="Country"
                        />
                    </div>
                    {/* Region/State */}
                    <div className="relative">
                        <FiMap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            name="region" 
                            value={userData.region || ''} 
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 text-sm text-white focus:border-blue-500" 
                            placeholder="State/Province"
                        />
                    </div>
                    {/* City */}
                    <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            name="city" 
                            value={userData.city || ''} 
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 text-sm text-white focus:border-blue-500" 
                            placeholder="City"
                        />
                    </div>
                </div>
            </div>

            {/* 4. Education & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Highest Education</label>
                    <div className="relative">
                        <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                        <input 
                            name="education" 
                            value={userData.education || ''} 
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all" 
                            placeholder="University/Degree"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact Number</label>
                    <div className="relative">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                        <input 
                            name="mobile" 
                            value={userData.mobile || ''} 
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all font-bold" 
                            placeholder="+XX XXXXXXXXXX"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfo;