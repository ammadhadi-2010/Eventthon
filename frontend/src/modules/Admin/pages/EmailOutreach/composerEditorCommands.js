/** Rich-text commands scoped to the composer editor element. */

export function focusEditor(editorEl) {
  if (!editorEl) return;
  editorEl.focus();
}

export function runEditorCommand(editorEl, command, value = null) {
  focusEditor(editorEl);
  if (command === 'createLink') {
    const url = String(value || '').trim();
    if (!url) return false;
    return document.execCommand('createLink', false, url);
  }
  if (command === 'fontName' || command === 'fontSize') {
    return document.execCommand(command, false, value);
  }
  return document.execCommand(command, false, value);
}

export function insertHtmlAtCursor(editorEl, html) {
  focusEditor(editorEl);
  const ok = document.execCommand('insertHTML', false, html);
  if (!ok && editorEl) {
    editorEl.insertAdjacentHTML('beforeend', html);
  }
  return true;
}

export function buildCtaButtonHtml(text, link) {
  const label = String(text || 'Visit EventThon').trim();
  const href = String(link || 'https://eventthone.com').trim();
  return (
    '<p style="text-align:center;margin:24px 0;">' +
    `<a href="${href}" target="_blank" rel="noopener noreferrer" ` +
    'style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#6366f1);' +
    'color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">' +
    `${label}</a></p>`
  );
}
