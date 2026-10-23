import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/*
 * Mise en forme légère des messages, comme dans la maquette : paragraphes, listes « - », **gras**
 * et @mentions. Le texte est transformé en éléments React (jamais injecté en HTML) : aucun risque XSS.
 */

export type Block = { kind: 'paragraph'; lines: string[] } | { kind: 'list'; items: string[] };

export function parseBlocks(text: string): Block[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.split('\n').filter((line) => line.trim() !== ''))
    .filter((lines) => lines.length > 0)
    .flatMap<Block>((lines) => {
      const items = lines.filter((line) => line.startsWith('- '));
      const rest = lines.filter((line) => !line.startsWith('- '));
      const blocks: Block[] = [];
      if (rest.length) blocks.push({ kind: 'paragraph', lines: rest });
      if (items.length) blocks.push({ kind: 'list', items: items.map((item) => item.slice(2)) });
      return blocks;
    });
}

const INLINE = /(\*\*[^*]+\*\*|(?<=^|[\s(])@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)/g;

export function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('@') && part.length > 1) {
      return (
        <Link
          key={index}
          href={`/membres/${encodeURIComponent(part.slice(1))}`}
          className="bg-brand-soft px-1 font-semibold text-brand-text"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('max-w-[68ch] text-[15.5px] leading-[1.65] [overflow-wrap:anywhere] [&>*+*]:mt-[.8em]', className)}>
      {parseBlocks(text).map((block, index) =>
        block.kind === 'list' ? (
          <ul key={index} className="list-disc pl-[1.2em]">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
