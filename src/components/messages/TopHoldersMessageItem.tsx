'use client';

import { FC } from 'react';
import { TopHoldersChatContent } from '@/types/chatItem';
import { LuExternalLink } from 'react-icons/lu';
import { formatNumber } from '@/utils/formatNumber';

interface TopHoldersChatItemProps {
  props: TopHoldersChatContent;
}

export const TopHoldersMessageItem: FC<TopHoldersChatItemProps> = ({
  props,
}) => {
  // Calculate the total amount held by all displayed holders
  const totalAmount = props.data.reduce(
    (sum, holder) => sum + holder.amount,
    0
  );

  // Calculate percentage for each holder
  const calculatePercentage = (amount: number) => {
    return ((amount / totalAmount) * 100).toFixed(2);
  };

  // Determine if we have a high concentration (more than 50% held by top 3)
  const top3Total = props.data
    .slice(0, 3)
    .reduce((sum, holder) => sum + holder.amount, 0);
  const highConcentration = top3Total / totalAmount > 0.5;

  return (
    <div className="flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-textColor">
              Top Holders Analysis
            </h2>
            {highConcentration && (
              <div className="flex items-center px-3 py-1 bg-primary/20 text-textColor rounded-full text-xs">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                High Concentration
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface/60 text-secText">
              <tr>
                <th scope="col" className="px-4 py-3 w-16 text-center">
                  #
                </th>
                <th scope="col" className="px-4 py-3">
                  Wallet
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Balance
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Percentage
                </th>
                <th scope="col" className="px-4 py-3 text-center w-24">
                  Insider
                </th>
              </tr>
            </thead>
            <tbody>
              {props.data.map((holder, index) => {
                const percentage = parseFloat(
                  calculatePercentage(holder.amount)
                );

                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-surface/30'
                    } border-b border-border/30 hover:bg-primaryDark/5 transition-colors`}
                  >
                    <td className="px-4 py-2.5 text-center font-medium text-secText">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <div className="flex items-center">
                        <div
                          className={`h-8 w-1 mr-2 rounded-r ${
                            holder.insider ? 'bg-primary' : 'bg-transparent'
                          }`}
                        ></div>
                        <div className="font-mono tracking-tight text-secText">
                          {holder.owner.slice(0, 5)}...{holder.owner.slice(-5)}
                        </div>
                        <a
                          href={`https://solscan.io/account/${holder.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 text-secText hover:text-primary transition-colors"
                        >
                          <LuExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-secText">
                      {formatNumber(holder.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-20 bg-border/30 rounded-full h-1.5 mr-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              percentage > 25
                                ? 'bg-primary'
                                : percentage > 10
                                  ? 'bg-primary/75'
                                  : percentage > 5
                                    ? 'bg-primary/50'
                                    : 'bg-primary/25'
                            }`}
                            style={{
                              width: `${Math.min(percentage * 3, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span
                          className={`${
                            percentage > 25 ? 'text-primary' : 'text-secText'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {holder.insider ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-textColor">
                          Yes
                        </span>
                      ) : (
                        <span className="text-secText text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="text-xs text-secText flex flex-col gap-1">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>
                {props.data.filter((h) => h.insider).length > 0
                  ? `${props.data.filter((h) => h.insider).length} insider wallets identified`
                  : 'No insider wallets identified'}
              </span>
            </div>
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full ${
                  highConcentration ? 'bg-primary' : 'bg-primary/50'
                } mr-2`}
              ></div>
              <span>
                {highConcentration
                  ? 'High concentration of tokens in top holders (higher volatility risk)'
                  : 'Token distribution appears balanced among top holders'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
