export function startStreamReply({
  fullText,
  chunkSize = 3,
  delayMs = 16,
  onTick,
  onComplete,
}) {
  let index = 0;
  const timerId = window.setInterval(() => {
    index += chunkSize;
    onTick(fullText.slice(0, index), index < fullText.length);
    if (index >= fullText.length) {
      window.clearInterval(timerId);
      onComplete();
    }
  }, delayMs);
  return timerId;
}

export function stopStreamReply(timerId) {
  if (timerId) window.clearInterval(timerId);
}
