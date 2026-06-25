import React from 'react';
import './gigRichTextEditor.css';

export default function GigStyleRichTextEditor({
  editorRef,
  imageInputRef,
  toolbarItems,
  activeTools,
  textLength,
  maxLength,
  placeholder,
  onDescriptionInput,
  applyFormat,
  onImagePick,
}) {
  return (
    <div className="cp-rte-wrap">
      <div className="create-gig-toolbar" role="toolbar" aria-label="Formatting">
        {toolbarItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`create-gig-tool-btn${activeTools.includes(item) ? ' is-active' : ''}`}
            onMouseDown={(event) => {
              event.preventDefault();
              applyFormat(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={onImagePick} />
      <div
        ref={editorRef}
        className="create-gig-editor"
        contentEditable
        dir="ltr"
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={onDescriptionInput}
      />
      <div className="create-gig-counter">
        {textLength}/{maxLength}
      </div>
    </div>
  );
}
