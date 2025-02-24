// BrowserTabs.tsx
import React from 'react';
import useThemeManager from '../../models/ThemeManager';
import { Tab, TerminalTabsProps} from './message_items/general/BaseTabItem';
import { formatNumber } from '../../utils/formatNumber';
import { BasicMetricCard} from './GoatIndexMetrics';
import { motion } from 'framer-motion';
import BaseGridChatItem from './message_items/general/BaseGridChatItem';
import { ExternalLink } from 'lucide-react';


const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  customTabContent,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
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
            <span>{row.Category === 'VOLUME' ? `$ ${formatNumber(Number(row.Count))}` : formatNumber(Number(row.Count))}</span>
          </div>
    
          {/* Buy/Sell Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">BUYS</span>
              <span>
                {row.Category === 'VOLUME' ? `$ ${formatNumber(Number(row.buys))}` : formatNumber(Number(row.buys))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">SELLS</span>
              <span>
                {row.Category === 'VOLUME' ? `$ ${formatNumber(Number(row.sells))}` : formatNumber(Number(row.sells))}
              </span>
            </div>
          </div>
        </div>
      ));

      const fixedRow = tab.content.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="space-y-2">
          <BasicMetricCard
            label={String(row.Category)}
            value={row.Category === 'VOLUME' ? `$ ${formatNumber(Number(row.buys)+ (Number(row.sells)))}` : formatNumber(Number(row.buys)+ (Number(row.sells)))}
          />
        </div>
      ));
    
      return (
        <div className="space-y-6 font-mono">
          {mappedRows}
    
          <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-1 items-start overflow-y-auto p-1 rounded-xl scrollbar-thin scrollbar-thumb-primary scrollbar-track-background"
          >
            {fixedRow}
            </motion.div>
        </div>
      );
    }

    if (tab.name === "BubbleMaps"){
      return (
          <iframe
            src={`https://app.bubblemaps.io/sol/token/${tab.content.rows[0].address}`}
            className="w-full h-64 md:h-94 rounded-lg"
          />
      );
    }
    if (tab.name === "Holders") {
      const isLoading = tab.isLoading;
      const rows = tab.content.rows;
      const maxRetries = tab.maxRetries;
      const retryCount = tab.retryCount

      if (!maxRetries || !retryCount) {
        return (
          <BaseGridChatItem col={1}>
            <div className="p-4 text-center text-gray-400">
              Failed to load top holders
            </div>
          </BaseGridChatItem>
        );
      }
    
      if (isLoading) {
        return (
          <BaseGridChatItem col={1}>
            <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="mt-4 text-sm text-gray-400">
                Loading top holders... Attempt {retryCount + 1}/{maxRetries}
              </p>
            </div>
          </BaseGridChatItem>
        );
      }

      
    
      if (!rows || rows.length === 0) {
        return (
          <BaseGridChatItem col={1}>
            <div className="p-4 text-center text-gray-400">
              No holder data available
            </div>
          </BaseGridChatItem>
        );
      }
    
      return (
        <BaseGridChatItem col={1}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Top Holders Information</h2>
            <div>
              <div className="grid grid-cols-2 gap-x-6 py-2 font-medium text-left uppercase tracking-wider border-b border-gray-700">
                <span>Owner</span>
                <span className="text-right">Balance</span>
              </div>
    
              <div>
                {rows.map((value, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-x-6 py-2 items-center"
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
                        className="text-xs font-medium rounded-lg hover:scale-105 hover:shadow-lg transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
    
                    <div className="text-right">{formatNumber(Number(value.amount))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BaseGridChatItem>
      );
    }
    if (tab.name === "Token Score and Analytics") {
        
      const message = tab.content.rows[1] || "Failed to load";
      const score = Number(tab.content.rows[0]) || 0;
      const scoreColor =
      score >=85
          ? 'text-dark-green-500'
          : score >= 70
            ? 'text-light-green-500'
            : score >=40
              ? 'text-orange-500'
              : 'text-red-500';
    
      return (
        <BaseGridChatItem col={1}>
          <div>
          <span className={`${scoreColor} font-semibold p-2`}>
            Risk Level: {score}
          </span>
          <span className={`font-semibold p-2`}>
            Risk Level: {String(message)}
          </span>
          </div>
        </BaseGridChatItem>
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
                  colIndex === tab.content!.headers.length - 1 ? 'text-right' : ''
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
      className={`w-full rounded-lg ${className}`}
      style={{ 
        background: theme.sec_background,
        color: theme.textColor,
      }}
    >
      <div 
        className="flex border-b" 
        style={{ borderColor: theme.border }}
      >
        <div className="flex-1 flex">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-r cursor-pointer transition-colors ${
                tabClassName
              } ${tab.id === activeTabId ? activeTabClassName : ''}`}
              style={{
                borderColor: theme.border,
                background: tab.id === activeTabId ? theme.backgroundContrast : 'transparent',
                color: tab.id === activeTabId ? theme.textColor : theme.secText,
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-4 ${contentClassName}`}>
        {tabs.map((tab) => (
          tab.id === activeTabId && (
            <div key={tab.id}>
              {customTabContent ? customTabContent(tab) : renderDefaultTabContent(tab)}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default TerminalTabs;