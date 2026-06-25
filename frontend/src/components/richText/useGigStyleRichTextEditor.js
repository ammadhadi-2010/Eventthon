import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const GIG_RICH_TEXT_TOOLBAR = ['B', 'I', 'U', '-', '=', '~', '...', 'img', '"', '</>'];

export function htmlTextLength(html) {
  if (!html) return 0;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;
}

export default function useGigStyleRichTextEditor({ value = '', maxLength = 2500, onChange }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const skipNextSyncRef = useRef(false);
  const [activeTools, setActiveTools] = useState([]);

  const safeValue = value == null ? '' : String(value);
  const textLength = useMemo(() => htmlTextLength(safeValue), [safeValue]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    const nextHtml = safeValue || '';
    if (el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }, [safeValue]);

  const emitChange = useCallback(
    (html) => {
      const len = htmlTextLength(html);
      if (len > maxLength) return;
      skipNextSyncRef.current = true;
      onChange?.(html);
    },
    [maxLength, onChange],
  );

  const onDescriptionInput = useCallback(
    (event) => {
      const html = event.currentTarget.innerHTML;
      const len = htmlTextLength(html);
      if (len <= maxLength) {
        emitChange(html);
        return;
      }
      event.currentTarget.innerHTML = safeValue || '';
    },
    [emitChange, maxLength, safeValue],
  );

  const applyFormat = useCallback(
    (tool) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();

      const cmdMap = {
        B: 'bold',
        I: 'italic',
        U: 'underline',
        '-': 'insertUnorderedList',
        '=': 'insertOrderedList',
        '~': 'strikeThrough',
        '...': 'insertHorizontalRule',
      };

      if (tool === 'img') {
        imageInputRef.current?.click();
      } else if (tool === '</>') {
        const selectedText = window.getSelection()?.toString() || 'code';
        document.execCommand('insertText', false, `\`${selectedText}\``);
      } else if (tool === '"') {
        document.execCommand('formatBlock', false, 'blockquote');
      } else if (cmdMap[tool]) {
        document.execCommand(cmdMap[tool], false, null);
      }

      emitChange(editor.innerHTML);
      setActiveTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
    },
    [emitChange],
  );

  const onImagePick = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('insertImage', false, reader.result);
        emitChange(editor.innerHTML);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    },
    [emitChange],
  );

  return {
    editorRef,
    imageInputRef,
    activeTools,
    textLength,
    toolbarItems: GIG_RICH_TEXT_TOOLBAR,
    onDescriptionInput,
    applyFormat,
    onImagePick,
  };
}
