'use client';

import { FC, useState, useEffect } from 'react';
import { LuGithub } from 'react-icons/lu';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { IoMdBug } from 'react-icons/io';

interface BugReportProps {
  props: {
    url: string;
    title: string;
    description: string;
    stepsToReproduce: string;
    expectedBehavior: string;
    actualBehavior: string;
    browser?: string;
    device?: string;
    additionalInfo?: string;
  };
}

export const BugReportMessageItem: FC<BugReportProps> = ({ props: props }) => {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (props) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [props]);

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-xs text-secText">Bug Report Card</div>
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 transition text-sm flex items-center"
      >
        Create Issue
        <LuGithub className="ml-1" size={16} />
      </a>
    </div>
  );

  return (
    <BaseStatusMessageItem
      title="Bug Report"
      status="error"
      statusText="GitHub Issue"
      icon={<IoMdBug size={20} className="text-error" />}
      footer={footer}
    >
      <MaskedRevealLoader isLoading={loading}>
        <div className="mt-2 mb-4">
          <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
            <p className="text-secText text-sm">Issue Title</p>
            <p className="text-textColor text-xl font-bold animate-fadeIn">
              {props.title}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
            <p className="text-secText text-sm mb-2">Description</p>
            <p className="text-textColor animate-fadeIn">
              {expanded
                ? props.description
                : props.description.substring(0, 150) +
                  (props.description.length > 150 ? '...' : '')}
            </p>
            {props.description.length > 150 && (
              <button
                onClick={handleExpandToggle}
                className="text-primary hover:text-primary/80 text-sm mt-2 flex items-center"
              >
                {expanded ? 'Show less' : 'Read more'}
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
            <p className="text-secText text-sm mb-2">Steps to Reproduce</p>
            <p className="text-textColor animate-fadeIn whitespace-pre-line">
              {props.stepsToReproduce}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
            <p className="text-secText text-sm mb-2">Expected Behavior</p>
            <p className="text-textColor animate-fadeIn">
              {props.expectedBehavior}
            </p>
          </div>

          <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
            <p className="text-secText text-sm mb-2">Actual Behavior</p>
            <p className="text-textColor animate-fadeIn">
              {props.actualBehavior}
            </p>
          </div>
        </div>

        {(props.browser || props.device) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {props.browser && (
              <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
                <p className="text-secText text-sm mb-2">Browser</p>
                <p className="text-textColor animate-fadeIn">{props.browser}</p>
              </div>
            )}

            {props.device && (
              <div className="rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
                <p className="text-secText text-sm mb-2">Device</p>
                <p className="text-textColor animate-fadeIn">{props.device}</p>
              </div>
            )}
          </div>
        )}

        {props.additionalInfo && (
          <div className="mt-4">
            <div className="bg-background rounded-lg p-4 border-l-4 border-error transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
              <p className="text-secText text-sm mb-2">
                Additional Information
              </p>
              <p className="text-textColor animate-fadeIn italic">
                {props.additionalInfo}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex space-x-4">
            <a
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300 flex-1"
            >
              <IoMdBug className="w-5 h-5 mr-2" />
              Report Bug
            </a>
          </div>
        </div>
      </MaskedRevealLoader>
    </BaseStatusMessageItem>
  );
};
