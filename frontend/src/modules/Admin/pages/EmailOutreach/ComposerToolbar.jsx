import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
} from 'lucide-react';

function ToolBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      className="eo-tool-btn"
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ComposerToolbar({ onCommand }) {
  const handleLink = () => {
    const url = window.prompt('Enter URL (include https://)');
    if (url) onCommand('createLink', url);
  };

  return (
    <div className="eo-composer-toolbar" role="toolbar" aria-label="Formatting">
      <ToolBtn label="Bold" onClick={() => onCommand('bold')}><Bold size={14} /></ToolBtn>
      <ToolBtn label="Italic" onClick={() => onCommand('italic')}><Italic size={14} /></ToolBtn>
      <ToolBtn label="Underline" onClick={() => onCommand('underline')}><Underline size={14} /></ToolBtn>
      <ToolBtn label="Strikethrough" onClick={() => onCommand('strikeThrough')}><Strikethrough size={14} /></ToolBtn>
      <span className="eo-tool-divider" aria-hidden />
      <select
        className="eo-tool-select"
        defaultValue="Inter"
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => onCommand('fontName', e.target.value)}
      >
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
      </select>
      <select
        className="eo-tool-select eo-tool-select--sm"
        defaultValue="3"
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => onCommand('fontSize', e.target.value)}
      >
        <option value="2">12</option>
        <option value="3">14</option>
        <option value="4">16</option>
        <option value="5">18</option>
      </select>
      <span className="eo-tool-divider" aria-hidden />
      <ToolBtn label="Bulleted list" onClick={() => onCommand('insertUnorderedList')}><List size={14} /></ToolBtn>
      <ToolBtn label="Numbered list" onClick={() => onCommand('insertOrderedList')}><ListOrdered size={14} /></ToolBtn>
      <ToolBtn label="Insert link" onClick={handleLink}><Link2 size={14} /></ToolBtn>
    </div>
  );
}
