'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import { AssetsResponse } from '@/types/lulo';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';

interface LuloAssetsMessageItemProps {
  props: AssetsResponse;
}

export const LuloAssetsMessageItem: FC<LuloAssetsMessageItemProps> = ({
  props,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (props) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [props]);

  useEffect(() => {
    // Auto-rotate focus through token items
    if (!loading && props.tokenBalance.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % props.tokenBalance.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading, props.tokenBalance]);

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-xs text-secText">Powered by Lulo Finance</div>
      <a
        href="https://lulo.finance"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 transition text-sm flex items-center"
      >
        Learn more
        <svg
          className="w-3 h-3 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          ></path>
        </svg>
      </a>
    </div>
  );

  const luloIcon = (
    <Image
      height={40}
      width={40}
      src="/lulo.png"
      alt="Lulo Finance"
      className="rounded-lg shadow-md"
    />
  );

  return (
    <BaseStatusMessageItem
      title="Lulo Finance"
      status="default"
      statusText="Portfolio Overview"
      icon={luloIcon}
      footer={footer}
    >
      <MaskedRevealLoader isLoading={loading}>
        {/* Stats Section with animations */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-surface">
            <p className="text-secText text-sm">Deposit Value</p>
            <p className="text-textColor text-2xl font-bold animate-fadeIn">
              ${props.depositValue.toFixed(2)}
            </p>
          </div>
          <div
            className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-surface"
            style={{ animationDelay: '0.2s' }}
          >
            <p className="text-secText text-sm">Interest Earned</p>
            <p className="text-green-500 text-2xl font-bold animate-fadeIn">
              +${props.interestEarned.toFixed(2)}
            </p>
          </div>
          <div
            className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-surface"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-secText text-sm">Total Value</p>
            <p className="text-textColor text-2xl font-bold animate-fadeIn">
              ${props.totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Token Balances */}
        <div className="mt-6">
          <h3 className="text-base font-semibold text-textColor mb-3">
            Token Balances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.tokenBalance.map((token, index) => (
              <a
                key={index}
                href={`https://dexscreener.com/solana/${token.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 
                          ${activeIndex === index ? 'bg-primary/10 ring-2 ring-primary' : 'bg-background hover:bg-surface'}`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      height={40}
                      width={40}
                      src={`/${token.mint}.png`}
                      alt="Token"
                      className="rounded-full shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.png';
                      }}
                    />
                    {activeIndex === index && (
                      <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-textColor group-hover:text-primary transition-colors">
                      {token.balance.toFixed(2)}
                    </h3>
                    <p className="text-xs text-secText mt-1">
                      {token.mint.substring(0, 4)}...{token.mint.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm font-medium text-secText">
                    ${token.usdValue.toFixed(2)}
                  </p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* Animated highlight line */}
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-transform duration-300 
                                ${activeIndex === index ? 'w-full scale-x-100' : 'w-0 scale-x-0'}`}
                ></div>
              </a>
            ))}
          </div>
        </div>
      </MaskedRevealLoader>
    </BaseStatusMessageItem>
  );
};
