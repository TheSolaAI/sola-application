import React, { useRef, useState } from 'react';
import { Trash2, Upload } from 'react-feather';
import { Dropdown } from '../general/DropDown.tsx';

interface EditRoomContentProps {
  onClose: () => void;
}

const EditRoomContent: React.FC<EditRoomContentProps> = ({ onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState('');
  const [roomIcon] = useState('');

  const handleNameSubmit = () => {
    console.log('Name submitted');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File uploaded');
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      console.log('Delete confirmed');
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="space-y-6 lg:w-[250px]">
      {/* Chat Icon Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {roomIcon ? (
            <img
              src={roomIcon}
              alt="Chat Icon"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
              <Upload className="w-8 h-8 text-textColor/50" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-primaryDark transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Chat Name Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-textColor">Chat Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameSubmit}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-textColor focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter chat name"
        />
      </div>

      {/* Delete Section */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleDelete}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            showDeleteConfirm
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          {showDeleteConfirm ? 'Confirm Delete' : 'Delete Chat'}
        </button>
      </div>
    </div>
  );
};

interface EditRoomProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: null | HTMLElement;
  roomID: string;
}

export const EditRoom: React.FC<EditRoomProps> = ({
  isOpen,
  onClose,
  anchorEl,
}) => {
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Chat Settings"
      mobileTitle="Chat Settings"
      width="auto"
      direction="up"
    >
      <EditRoomContent onClose={onClose} />
    </Dropdown>
  );
};
