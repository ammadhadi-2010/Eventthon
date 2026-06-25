import React from 'react';
// FiCamera aur FiImage ko yahan add kar diya gaya hai
import { FiX, FiCheck, FiTrash2, FiEdit3, FiCamera, FiImage } from 'react-icons/fi';

const ImageEditorModal = ({ isOpen, onClose, onSave, onUpdate, onDelete, imageSrc, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-8 flex flex-col items-center">
          <div className="relative group w-full max-h-[400px] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
            {imageSrc ? (
                <img src={imageSrc} alt="Preview" className="max-w-full max-h-[350px] object-contain" />
            ) : (
                <div className="text-slate-500 py-20 text-sm italic">No image selected</div>
            )}
          </div>

          {/* Control Bar - New Design Icons Fixed */}
          <div className="flex justify-between items-center mt-8 px-4 w-full">
            <div className="flex gap-8">
                {/* Edit Button */}
                <button className="flex flex-col items-center gap-2 text-slate-300 hover:text-white transition-all">
                    <FiEdit3 size={24} />
                    <span className="text-xs font-medium">Edit</span>
                </button>

                {/* Update Button */}
                <button 
                    onClick={onUpdate}
                    className="flex flex-col items-center gap-2 text-slate-300 hover:text-white transition-all"
                >
                    <FiCamera size={24} />
                    <span className="text-xs font-medium">Update</span>
                </button>

                {/* Frames Button */}
                <button className="flex flex-col items-center gap-2 text-slate-300 hover:text-white transition-all">
                    <FiImage size={24} />
                    <span className="text-xs font-medium">Frames</span>
                </button>
            </div>

            {/* Delete Button */}
            <button 
                onClick={onDelete}
                className="flex flex-col items-center gap-2 text-slate-400 hover:text-red-500 transition-all"
            >
                <FiTrash2 size={24} />
                <span className="text-xs font-medium">Delete</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 bg-slate-900/50 border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2.5 rounded-full text-slate-400 font-bold hover:bg-white/5">
            Cancel
          </button>
          <button 
            onClick={onSave}
            disabled={!imageSrc}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-bold shadow-lg transition-all ${
                imageSrc ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20" : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <FiCheck /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;