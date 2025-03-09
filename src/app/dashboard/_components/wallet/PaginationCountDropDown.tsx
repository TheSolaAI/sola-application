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
      <div className="w-full">
        {PAGINATION_OPTIONS.map((count) => (
          <button
            key={count}
            className={`w-full hover:bg-surface flex-row flex items-center justify-between p-3 rounded-xl ${
              currentCount === count ? 'bg-primary/20' : ''
            }`}
            onClick={() => {
              onCountChange(count);
              onClose();
            }}
          >
            <h1 className="text-textColor font-medium text-md">
              {count} Items per Page
            </h1>
          </button>
        ))}
      </div>
    </Dropdown>
  );
};
