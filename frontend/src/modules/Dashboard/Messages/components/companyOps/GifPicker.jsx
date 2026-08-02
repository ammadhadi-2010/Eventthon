import React from 'react';

const GIFS = [
  { id: 'wave', url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', label: 'Wave' },
  { id: 'ok', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', label: 'Thumbs up' },
  { id: 'clap', url: 'https://media.giphy.com/media/7rjXk3yiCKj0I/giphy.gif', label: 'Clap' },
  { id: 'party', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', label: 'Celebrate' },
  { id: 'think', url: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif', label: 'Thinking' },
  { id: 'yes', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', label: 'Yes' },
  { id: 'mail', url: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif', label: 'Mail' },
  { id: 'hi', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', label: 'Hello' },
];

export default function GifPicker({ onPick, onClose }) {
  return (
    <div className="cops-gif" role="dialog" aria-label="GIF picker">
      <div className="cops-gif__head">
        <strong>GIFs</strong>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <div className="cops-gif__grid">
        {GIFS.map((gif) => (
          <button
            key={gif.id}
            type="button"
            title={gif.label}
            onClick={() => onPick?.(gif.url, gif.label)}
          >
            <img src={gif.url} alt={gif.label} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
