import type { MentionCandidate } from './mentionTypes.js';

type MentionContentProps = {
  content: string;
  knownUsernames: Set<string>;
  className?: string;
};

export function MentionContent({ content, knownUsernames, className = '' }: MentionContentProps) {
  const parts = content.split(/(@[\w.-]+)/g);

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          if (knownUsernames.has(username)) {
            return (
              <span key={`${part}-${index}`} className="font-semibold text-blue-600">
                {part}
              </span>
            );
          }
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </p>
  );
}

export type { MentionCandidate };
