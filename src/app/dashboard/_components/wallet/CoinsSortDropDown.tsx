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
      <div className="w-full p-2 space-y-2">
        {/* Sort Type Section */}
        <div className="border-border border-b py-2">
          <h2 className="text-secText text-md font-medium mb-2">Sort By</h2>
          <div className="space-y-1">
            {Object.values(SortType).map((sortType) => (
              <button
                key={sortType}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                  selectedSortType === sortType
                    ? 'bg-primaryDark text-textColor'
                    : 'hover:bg-surface text-secText'
                }`}
                onClick={() =>
                  handleSortSelection(sortType as SortType, selectedDirection)
                }
              >
                <span className="text-md text-textColor">{sortType}</span>
                {selectedSortType === sortType && (
                  <div className="flex items-center">
                    {selectedDirection === SortDirection.ASCENDING ? (
                      <LuArrowUp className="w-6 h-6 mr-2 text-textColor" />
                    ) : (
                      <LuArrowDown className="w-6 h-6 mr-2 text-textColor" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Direction Section */}
        <div className="border-border border-b py-2">
          <h2 className="text-secText text-md font-medium mb-2">Direction</h2>
          <div className="flex space-x-2">
            <button
              className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-colors ${
                selectedDirection === SortDirection.ASCENDING
                  ? 'bg-primaryDark text-textColor'
                  : 'hover:bg-surface text-secText'
              }`}
              onClick={() =>
                handleSortSelection(selectedSortType, SortDirection.ASCENDING)
              }
            >
              <PiSortAscendingDuotone className="w-5 h-5 mr-2 text-textColor" />
              Ascending
            </button>
            <button
              className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-colors ${
                selectedDirection === SortDirection.DESCENDING
                  ? 'bg-primaryDark text-textColor'
                  : 'hover:bg-surface text-secText'
              }`}
              onClick={() =>
                handleSortSelection(selectedSortType, SortDirection.DESCENDING)
              }
            >
              <PiSortDescendingDuotone className="w-5 h-5 mr-2 text-textColor" />
              Descending
            </button>
          </div>
        </div>

        {/* Solana Priority Toggle */}
        <div className="">
          <button
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-background"
            onClick={toggleSolanaPriority}
          >
            <span className="text-md font-medium">
              Prioritize Solana Tokens
            </span>
            <div
              className={`w-10 h-5 rounded-full relative transition-colors ${
                prioritizeSolana ? 'bg-primaryDark' : 'bg-backgroundContrast'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-surface shadow-md transition-transform ${
                  prioritizeSolana ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </Dropdown>
  );
};
