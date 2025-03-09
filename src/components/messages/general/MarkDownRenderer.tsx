'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useThemeManager from '@/store/ThemeManager';
import {
  a11yDark,
  oneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Image from 'next/image';

const MarkdownRenderer = ({ content }: { content: string }) => {
  /**
   * Global State
   */
  const { theme } = useThemeManager();

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-bold mt-3 mb-2" {...props} />
          ),

          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // img: ({ node, alt, src, ...props }) => (
          //   <Image
          //     alt={alt}
          //     src={src}
          //     className="max-w-full h-auto rounded-lg my-4"
          //     {...props}
          //   />
          // ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                language={match[1]}
                style={theme.baseTheme === 'dark' ? a11yDark : oneDark}
                PreTag="div"
                className="rounded-md overflow-auto"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-background rounded px-1 py-0.5" {...props}>
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-primaryDark hover:bg-primaryDark" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-sec_background" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-bold text-textColor uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1 my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
