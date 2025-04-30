'use client';
import { FC } from 'react';
import { Dropdown } from '@/components/common/DropDown';

interface PaginationCountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement;
  currentCount: number;
  onCountChange: (count: number) => void;
}

const PAGINATION_OPTIONS = [10, 20, 50, 100];

export const PaginationCountDropDown: FC<PaginationCountDropdownProps> = ({
  anchorEl,
  isOpen,
  onClose,
  currentCount,
  onCountChange,
}) => {
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Items per Page"
      mobileTitle="Items per Page"
      direction="down"
      width="auto"
    >
      <div className="w-full p-2">
        <div className="flex flex-col gap-2">
          {PAGINATION_OPTIONS.map((count) => (
            <button
              key={count}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                currentCount === count
                  ? 'bg-primaryDark text-white font-medium'
                  : 'bg-surface/30 text-textColor hover:bg-surface/50'
              }`}
              onClick={() => {
                onCountChange(count);
                onClose();
              }}
            >
              <span className="font-medium">{count} items</span>
            </button>
          ))}
        </div>
      </div>
    </Dropdown>
  );
};
