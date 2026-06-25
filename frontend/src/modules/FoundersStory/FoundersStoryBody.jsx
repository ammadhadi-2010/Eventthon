import React from 'react';

export default function FoundersStoryBody({ content }) {
  const paragraphs = String(content || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return <p className="fs-body__empty">Story content will appear here soon.</p>;
  }

  return (
    <div className="fs-body">
      {paragraphs.map((block) => (
        <p key={block.slice(0, 48)} className="fs-body__paragraph">
          {block.split('\n').map((line, index, arr) => (
            <React.Fragment key={`${line}-${index}`}>
              {line}
              {index < arr.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
