'use client';
import React, { useState } from 'react';
import { LuSave, LuTrash2 } from 'react-icons/lu';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { Dropdown } from '@/components/common/DropDown';

interface EditRoomContentProps {
  onClose: () => void;
  roodID: number;
}

const EditRoomContent: React.FC<EditRoomContentProps> = ({
  onClose,
  roodID,
}) => {
  const {
    updateChatRoom,
    deleteChatRoom,
    currentChatRoom,
    createChatRoom,
    setCurrentChatRoom,
  } = useChatRoomHandler();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState('');

  /**
   * Update the name of the selected chat room
   */
  const handleNameSubmit = () => {
    console.log('Name submitted');
    updateChatRoom({
      id: roodID,
      name: name,
    });
    onClose();
  };

  /**
   * Delete the selected room.
   * if the current room is deleted , move to a new room.
   */
  const handleDelete = () => {
    if (showDeleteConfirm) {
      console.log('Delete confirmed');
      deleteChatRoom(roodID);
      if (roodID === currentChatRoom?.id) {
        console.log('creating new room');
        createChatRoom({ name: 'New Chat' }).then((room) => {
          if (room) setCurrentChatRoom(room);
        });
      }
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="space-y-6 lg:w-[250px]">
      {/* Chat Name Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-textColor">Chat Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-textColor focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter New Chat Name"
        />
        <button
          onClick={handleNameSubmit}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors bg-primary/90 hover:bg-primary`}
        >
          <LuSave className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Delete Section */}
      <div className="pt-4 border-t border-border pb-4">
        <button
          onClick={handleDelete}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            showDeleteConfirm
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          <LuTrash2 className="w-4 h-4" />
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
  roomID: number;
}

export const EditRoom: React.FC<EditRoomProps> = ({
  isOpen,
  onClose,
  anchorEl,
  roomID,
}) => {
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Chat Settings"
      mobileTitle="Chat Settings"
      width="auto"
      direction="down"
      horizontalAlignment="right"
    >
      <EditRoomContent onClose={onClose} roodID={roomID} />
    </Dropdown>
  );
};
