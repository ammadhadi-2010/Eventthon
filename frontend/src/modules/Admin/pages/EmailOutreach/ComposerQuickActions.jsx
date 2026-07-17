import React from 'react';
import { CirclePlus, FileText, Paperclip } from 'lucide-react';

export default function ComposerQuickActions({ onInsertTemplate, onAddButton }) {
  const handleAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) window.alert(`Attached: ${file.name} (upload on send coming soon)`);
    };
    input.click();
  };

  return (
    <div className="eo-composer-quick">
      <button type="button" className="eo-quick-btn" onClick={() => onInsertTemplate?.()}>
        <FileText size={14} aria-hidden />
        Insert Template
      </button>
      <button type="button" className="eo-quick-btn" onClick={handleAttach}>
        <Paperclip size={14} aria-hidden />
        Attach File
      </button>
      <button type="button" className="eo-quick-btn" onClick={() => onAddButton?.()}>
        <CirclePlus size={14} aria-hidden />
        Add Button
      </button>
    </div>
  );
}
