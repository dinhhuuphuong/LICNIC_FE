import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';

type ChatRole = 'user' | 'assistant';

const markdownLink: Components['a'] = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline">
    {children}
  </a>
);

const markdownComponents: Partial<Components> = {
  a: markdownLink,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="[&>p]:m-0">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes('language-'));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded px-1 py-px font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 max-w-full overflow-x-auto rounded-lg p-2.5 font-mono text-[0.85em] leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => <blockquote className="my-2 border-l-2 pl-2 italic opacity-95">{children}</blockquote>,
  h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-sm font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 text-sm font-semibold">{children}</h3>,
};

export function ChatMessageMarkdown({
  content,
  role,
  isStreaming,
}: {
  content: string;
  role: ChatRole;
  isStreaming?: boolean;
}) {
  const prose =
    role === 'user'
      ? '[&_a]:text-blue-100 [&_code]:bg-blue-800/75 [&_code]:text-white [&_pre]:bg-blue-900/55 [&_pre]:text-blue-50 [&_blockquote]:border-blue-200/70 [&_blockquote]:text-blue-50'
      : '[&_a]:text-blue-700 [&_code]:bg-slate-200 [&_code]:text-slate-900 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_blockquote]:border-slate-300 [&_blockquote]:text-slate-700';

  if (role === 'assistant' && isStreaming) {
    return (
      <div className={`min-w-0 wrap-break-word whitespace-pre-wrap ${prose}`}>
        {content}
        <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-slate-500 align-[-0.15em]" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`min-w-0 wrap-break-word ${prose}`}>
      <Markdown components={markdownComponents}>{content}</Markdown>
    </div>
  );
}
