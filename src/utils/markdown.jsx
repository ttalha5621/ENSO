/** Minimal, safe Markdown → React renderer for AI text (no HTML injection). */
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) parts.push(<strong key={key} className="font-semibold text-[var(--text-strong)]">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={key} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">{tok.slice(1, -1)}</code>);
    else parts.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ text, className = '' }) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (bullet) {
      if (!list) list = { type: /^\s*\d/.test(line) ? 'ol' : 'ul', items: [] };
      list.items.push(bullet[1]);
    } else if (!line.trim()) {
      flush();
    } else if (/^-{3,}$/.test(line.trim())) {
      flush();
      blocks.push({ type: 'hr', key: idx });
    } else if (heading) {
      flush();
      blocks.push({ type: 'h', text: heading[1], key: idx });
    } else {
      flush();
      blocks.push({ type: 'p', text: line, key: idx });
    }
  });
  flush();

  return (
    <div className={`space-y-2.5 leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'hr') return <hr key={i} className="border-[var(--border)]" />;
        if (b.type === 'h') return <h4 key={i} className="pt-1 text-sm font-semibold text-[var(--text-strong)]">{inline(b.text, i)}</h4>;
        if (b.type === 'p') return <p key={i}>{inline(b.text, i)}</p>;
        const Tag = b.type;
        return (
          <Tag key={i} className={`space-y-1.5 ps-5 ${Tag === 'ol' ? 'list-decimal' : 'list-disc'} marker:text-violet-400`}>
            {b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}
          </Tag>
        );
      })}
    </div>
  );
}
