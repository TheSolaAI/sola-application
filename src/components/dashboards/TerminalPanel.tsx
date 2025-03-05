// BrowserTabs.tsx
import React from 'react';
import useThemeManager from '../../models/ThemeManager';
import { Tab, TerminalTabsProps } from '../messages/general/BaseTabItem';
import { formatNumber } from '../../utils/formatNumber';
import BaseGridChatItem from '../messages/general/BaseGridChatItem';
import { ExternalLink } from 'lucide-react';

const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs,
  agentDetails,
  activeTabId,
  onTabChange,
  customTabContent,
  className = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const { theme } = useThemeManager();

  const switchTab = (tabId: number) => {
    onTabChange?.(tabId);
  };

  const renderDefaultTabContent = (tab: Tab) => {
    if (!tab.content) {
      return (
        <div
          className="flex items-center justify-center h-32"
          style={{ color: theme.secText }}
        >
          {tab.name} Content
        </div>
      );
    }

    if (tab.name === 'Stats') {
      const mappedRows = tab.content.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="space-y-2">
          {/* Category and Total */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>{row.Category}</span>
            <span>
              {row.Category === 'VOLUME'
                ? `$ ${formatNumber(Number(row.Count))}`
                : formatNumber(Number(row.Count))}
            </span>
          </div>

          {/* Buy/Sell Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden ">
            <div
              className="absolute top-0 left-0 h-full bg-green-500"
              style={{
                width: `${(Number(row.buys) / (Number(row.buys) + Number(row.sells))) * 100}%`,
              }}
            />
            <div
              className="absolute top-0 right-0 h-full bg-red-500"
              style={{
                width: `${(Number(row.sells) / (Number(row.buys) + Number(row.sells))) * 100}%`,
              }}
            />
          </div>

          {/* Buy/Sell Labels */}
          <div className="flex justify-between text-sm ">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">BUYS</span>
              <span className="text-textColorContrast">
                {row.Category === 'VOLUME'
                  ? `$ ${formatNumber(Number(row.buys))}`
                  : formatNumber(Number(row.buys))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">SELLS</span>
              <span className="text-textColorContrast">
                {row.Category === 'VOLUME'
                  ? `$ ${formatNumber(Number(row.sells))}`
                  : formatNumber(Number(row.sells))}
              </span>
            </div>
          </div>
        </div>
      ));

      return <div className="space-y-6 font-mono">{mappedRows}</div>;
    }

    if (tab.name === 'BubbleMaps') {
      return (
        <iframe
          src={`https://app.bubblemaps.io/sol/token/${tab.content.rows[0].address}`}
          className="w-full h-64 md:h-94 rounded-lg"
        />
      );
    }

    if (tab.name === 'Holders') {
      if (!agentDetails || !agentDetails.data.topHolders) {
        return (
          <BaseGridChatItem col={1}>
            <div className="p-4 text-center text-gray-400">
              No holder data available
            </div>
          </BaseGridChatItem>
        );
      }

      return (
        <div className="w-full p-2">
          <div className="grid grid-cols-2 gap-x-6 py-2 text-textColorContrast font-semibold text-left uppercase tracking-wider border-b border-background">
            <span>Owner</span>
            <span className="text-right">Balance</span>
          </div>

          <div>
            {agentDetails.data.topHolders.map((value, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-x-8 py-2 items-center text-textColorContrast"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">
                    {String(value.owner).slice(0, 5)}...
                    {String(value.owner).slice(-5)}
                  </span>
                  <button
                    onClick={() =>
                      window.open(
                        `https://solscan.io/account/${value.owner}`,
                        '_blank',
                      )
                    }
                    className="hover:scale-105 hover:shadow-lg transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right">
                  {formatNumber(Number(value.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tab.name === 'Token Analytics') {
      const message = tab.content.rows[0]['message'] || 'Failed to load';
      const score = Number(tab.content.rows[0]['score']) || 0;
      const numericScore = typeof score === 'number' ? score : 0;

      const scoreColor =
        numericScore >= 85
          ? 'text-green-500 !important'
          : numericScore >= 70
            ? 'text-lime-500'
            : numericScore >= 40
              ? 'text-orange-500'
              : 'text-red-500';

      console.log('Score:', numericScore, 'Color class:', scoreColor);

      return (
        <div className="flex flex-col gap-2 text-textColorContrast">
          <span className={`font-semibold p-2`}>
            Token Score:
            <span className={`${scoreColor} font-semibold p-2`}>{score}</span>
          </span>
          <span className={`font-semibold p-2`}>
            Risk Analysis: {String(message)}
          </span>
          <span className={`font-light p-2 self-end `}>
            POWERED BY ANTI-RUG
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2 font-mono">
        <div
          className="flex justify-between text-sm border-b"
          style={{ borderColor: theme.border }}
        >
          {tab.content.headers.map((header, index) => (
            <span
              key={index}
              className={`w-1/${tab.content!.headers.length} ${
                index === 0 ? '' : 'text-center'
              } ${
                index === tab.content!.headers.length - 1 ? 'text-right' : ''
              }`}
            >
              {header}
            </span>
          ))}
        </div>
        {tab.content.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between text-sm">
            {tab.content!.headers.map((header, colIndex) => (
              <span
                key={colIndex}
                className={`w-1/${tab.content!.headers.length} ${
                  colIndex === 0 ? '' : 'text-center'
                } ${
                  colIndex === tab.content!.headers.length - 1
                    ? 'text-right'
                    : ''
                }`}
              >
                {row[header]}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`w-full rounded-lg overflow-hidden border bg-dashboardBackground shadow-lg ${className}`}
      style={{
        color: theme.textColor,
      }}
    >
      <div>
        <div className="flex-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-backgroundContrast">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex w-full items-center justify-center gap-2 p-2 border-r border-b cursor-pointer transition-colors ${
                tabClassName
              } ${tab.id === activeTabId ? 'bg-background text-textColor' : 'bg-dashboardBackground text-textColorContrast'}`}
              style={{
                borderColor: theme.background,
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-4 ${contentClassName}`}>
        {tabs.map(
          (tab) =>
            tab.id === activeTabId && (
              <div key={tab.id}>
                {customTabContent
                  ? customTabContent(tab)
                  : renderDefaultTabContent(tab)}
              </div>
            ),
        )}
      </div>
    </div>
  );
};

export default TerminalTabs;
