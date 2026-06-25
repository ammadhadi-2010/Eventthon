import React from 'react';
import { PenTool } from 'lucide-react';

const ProfessionalBio = ({ bio, onChange }) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
      {/* Label Section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
          <PenTool size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Step 2: Storytelling</p>
          <h4 className="text-sm font-bold text-white tracking-tight">Professional Journey</h4>
        </div>
      </div>

      {/* Bio Textarea */}
      <div className="relative group">
        <textarea 
          name="bio" 
          value={bio} 
          onChange={(e) => onChange({ bio: e.target.value })} 
          className="w-full h-72 bg-[#020617]/50 border border-white/10 rounded-[32px] p-8 text-white outline-none focus:border-blue-500/40 transition-all resize-none text-lg leading-relaxed shadow-inner placeholder:text-slate-600" 
          placeholder="Describe your expertise, the problems you solve, and your vision. Make it impactful..." 
        />
        
        {/* Decorative corner accent */}
        <div className="absolute bottom-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
           <i className="fi fi-rr-quote-right text-2xl text-blue-500"></i>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 italic px-4">
        * Tip: Focus on your achievements and what makes your workflow unique.
      </p>
    </div>
  );
};

export default ProfessionalBio;