'use client';

import React, { useState, useEffect } from 'react';
import {
  LuExternalLink,
  LuLink2,
  LuChevronDown,
  LuChevronUp,
  LuClipboard,
  LuQuote,
  LuCheck,
} from 'react-icons/lu';
import { toast } from 'sonner';
import Image from 'next/image';

interface SourceProps {
  sourceType: string;
  id: string;
  url: string;
  title?: string;
}

export const SourceMessageItem: React.FC<SourceProps> = ({
  sourceType,
  id,
  url,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);

  // Format domain name for display
  const getDomainName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown source';
    }
  };

  const domainName = getDomainName(url);

  // Attempt to load favicon
  useEffect(() => {
    try {
      const domain = new URL(url).origin;
      setFavicon(`${domain}/favicon.ico`);
    } catch {
      setFavicon(null);
    }
  }, [url]);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('URL copied to clipboard');
  };

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `${title ? title + '. ' : ''}Retrieved from ${url}`;
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied to clipboard');
  };

  // Format citation
  const formatCitation = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `${title ? title + '. ' : ''}Retrieved on ${date} from ${domainName}`;
  };

  return (
    <div className="w-full my-3 animate-in fade-in duration-300">
      <div
        className={`flex flex-col rounded-2xl border ${isExpanded ? 'border-primary border-opacity-50' : 'border-border'} bg-surface shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
      >
        {/* Header / Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-between w-full px-4 py-3 hover:bg-sec_background transition-all duration-200 ${isExpanded ? 'bg-sec_background bg-opacity-70' : ''}`}
        >
          <div className="flex items-center gap-3">
            {favicon ? (
              <Image
                src={favicon}
                alt=""
                className={`w-5 h-5 rounded-sm object-contain ${isExpanded ? 'opacity-100' : 'opacity-80'}`}
                width={20}
                height={20}
                onError={() => setFavicon(null)}
              />
            ) : (
              <div
                className={`p-1 rounded-full ${isExpanded ? 'bg-primary bg-opacity-20' : ''} transition-all duration-300`}
              >
                <LuLink2 size={18} className="text-primaryDark" />
              </div>
            )}
            <div className="flex flex-col items-start">
              <span
                className={`font-medium text-sm ${isExpanded ? 'text-textColor' : 'text-secText'} text-left truncate max-w-[200px] sm:max-w-sm md:max-w-md`}
              >
                {title || domainName}
              </span>
              <span className="text-xs text-secText opacity-70 flex items-center gap-1.5">
                <span>{domainName}</span>
                <div className="h-1 w-1 rounded-full bg-secText opacity-40"></div>
                <span>Source</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs flex items-center gap-1 text-primaryDark hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary hover:bg-opacity-10"
            >
              <LuExternalLink size={14} />
              <span className="hidden sm:inline">Open</span>
            </a>
            {isExpanded ? (
              <LuChevronUp size={16} className="text-primaryDark" />
            ) : (
              <LuChevronDown size={16} className="text-secText" />
            )}
          </div>
        </button>

        {/* Source Content */}
        {isExpanded && (
          <div className="px-4 py-3 border-t border-border bg-surface bg-opacity-60">
            {/* Citation preview */}
            <div className="mb-4 p-3 bg-sec_background rounded-lg border border-border border-opacity-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primaryDark flex items-center gap-1">
                  <LuQuote size={14} />
                  Citation
                </span>
                <button
                  onClick={handleCopyCitation}
                  className="text-secText hover:text-primaryDark transition-colors p-1 rounded-md hover:bg-background text-xs flex items-center gap-1"
                >
                  <LuClipboard size={12} />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-sm text-secText italic">{formatCitation()}</p>
            </div>

            {/* Source details */}
            <div className="flex flex-col space-y-3">
              {title && (
                <div className="flex flex-col">
                  <span className="text-xs text-secText font-medium">
                    Title
                  </span>
                  <span className="text-sm text-textColor">{title}</span>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-xs text-secText font-medium flex items-center gap-1">
                  <LuLink2 size={12} />
                  URL
                </span>
                <div className="flex items-center gap-2 mt-1 group">
                  <div className="flex-1 overflow-hidden bg-sec_background rounded-md p-2 text-sm text-textColor break-all border border-border border-opacity-20">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primaryDark transition-colors"
                    >
                      {url}
                    </a>
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="text-secText hover:text-primaryDark transition-colors p-1.5 rounded-md hover:bg-sec_background"
                    title="Copy URL"
                  >
                    {isCopied ? (
                      <LuCheck size={16} className="text-green-500" />
                    ) : (
                      <LuClipboard size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-xs text-secText font-medium">
                    Source Type
                  </span>
                  <span className="text-sm text-secText">{sourceType}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-secText font-medium">
                    Source ID
                  </span>
                  <span className="text-sm text-secText font-mono">
                    {id.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceMessageItem;
