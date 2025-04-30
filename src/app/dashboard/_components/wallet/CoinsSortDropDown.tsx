'use client';
import { FC, useState } from 'react';
import { Dropdown } from '@/components/common/DropDown';
import { LuArrowDown, LuArrowUp } from 'react-icons/lu';
import {
  PiSortAscendingDuotone,
  PiSortDescendingDuotone,
} from 'react-icons/pi';

export enum SortType {
  TOTAL_PRICE = 'Total Price',
  TOKEN_PRICE = 'Token Price',
}

export enum SortDirection {
  ASCENDING = 'Ascending',
  DESCENDING = 'Descending',
}

interface CoinseSortDropDownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement;
  onSortChange: (
    sortType: SortType,
    direction: SortDirection,
    prioritizeSolana: boolean
  ) => void;
}

export const CoinsSortDropDown: FC<CoinseSortDropDownProps> = ({
  anchorEl,
  isOpen,
  onClose,
  onSortChange,
}) => {
  // State to track current sorting preferences
  const [selectedSortType, setSelectedSortType] = useState<SortType>(
    SortType.TOTAL_PRICE
  );
  const [selectedDirection, setSelectedDirection] = useState<SortDirection>(
    SortDirection.DESCENDING
  );
  const [prioritizeSolana, setPrioritizeSolana] = useState<boolean>(false);

  // Handle sort selection
  const handleSortSelection = (
    sortType: SortType,
    direction: SortDirection
  ) => {
    setSelectedSortType(sortType);
    setSelectedDirection(direction);
    onSortChange(sortType, direction, prioritizeSolana);
  };

  // Handle Solana prioritization toggle
  const toggleSolanaPriority = () => {
    const newPrioritySetting = !prioritizeSolana;
    setPrioritizeSolana(newPrioritySetting);
    onSortChange(selectedSortType, selectedDirection, newPrioritySetting);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Sort & Filter"
      mobileTitle="Sort & Filter"
      direction="up"
      width="auto"
      horizontalAlignment="auto"
    >
      <div className="overflow-hidden rounded-xl bg-sec_background w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-textColor">
            Sort & Filter Options
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Sort Type Section */}
          <div>
            <label className="text-xs uppercase tracking-wider text-secText mb-2 block">
              Sort By
            </label>
            <div className="space-y-2">
              {Object.values(SortType).map((sortType) => (
                <button
                  key={sortType}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedSortType === sortType
                      ? 'bg-primaryDark bg-opacity-20 border-l-4 border-primaryDark'
                      : 'bg-surface/30 hover:bg-surface/50'
                  }`}
                  onClick={() =>
                    handleSortSelection(sortType as SortType, selectedDirection)
                  }
                >
                  <span
                    className={`font-medium ${selectedSortType === sortType ? 'text-textColor' : 'text-secText'}`}
                  >
                    {sortType}
                  </span>
                  {selectedSortType === sortType && (
                    <div className="flex items-center">
                      {selectedDirection === SortDirection.ASCENDING ? (
                        <LuArrowUp className="w-5 h-5 text-textColor" />
                      ) : (
                        <LuArrowDown className="w-5 h-5 text-textColor" />
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Direction Section */}
          <div>
            <label className="text-xs uppercase tracking-wider text-secText mb-2 block">
              Direction
            </label>
            <div className="flex space-x-2">
              <button
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition-colors ${
                  selectedDirection === SortDirection.ASCENDING
                    ? 'bg-primaryDark bg-opacity-20 border-b-2 border-primaryDark'
                    : 'bg-surface/30 hover:bg-surface/50'
                }`}
                onClick={() =>
                  handleSortSelection(selectedSortType, SortDirection.ASCENDING)
                }
              >
                <PiSortAscendingDuotone className="w-5 h-5 mr-2" />
                <span className="font-medium">Ascending</span>
              </button>
              <button
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition-colors ${
                  selectedDirection === SortDirection.DESCENDING
                    ? 'bg-primaryDark bg-opacity-20 border-b-2 border-primaryDark'
                    : 'bg-surface/30 hover:bg-surface/50'
                }`}
                onClick={() =>
                  handleSortSelection(
                    selectedSortType,
                    SortDirection.DESCENDING
                  )
                }
              >
                <PiSortDescendingDuotone className="w-5 h-5 mr-2" />
                <span className="font-medium">Descending</span>
              </button>
            </div>
          </div>

          {/* Solana Priority Toggle */}
          <div className="pt-2 border-t border-border">
            <label className="text-xs uppercase tracking-wider text-secText mb-2 block">
              Special Filter
            </label>
            <div className="bg-surface/30 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-textColor">
                    Prioritize Solana Tokens
                  </span>
                  <p className="text-xs text-secText mt-1">
                    Show SOL at the top of the list
                  </p>
                </div>
                <button
                  onClick={toggleSolanaPriority}
                  className="focus:outline-none"
                >
                  <div
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      prioritizeSolana ? 'bg-primaryDark' : 'bg-surface'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        prioritizeSolana ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};
