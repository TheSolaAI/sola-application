import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Upload, X } from 'react-feather';

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
  roomID,
}) => {
  /**
   * Refs
   */
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Local State
   */
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // TODO: Remove these once the agents are linked with the chat
  const [name, setName] = useState('');
  const [roomIcon, setRoomIcon] = useState('');

  /**
   * Checks if the device is in mobile view
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && anchorEl && popupRef.current && !isMobile) {
      const anchorRect = anchorEl.getBoundingClientRect();
      setPosition({
        top: anchorRect.bottom + window.scrollY + 10,
        left: anchorRect.left + window.scrollX - 5,
        width: Math.max(anchorRect.width, 300), // Minimum width for better UX
      });
    }
  }, [isOpen, anchorEl, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        anchorEl &&
        !anchorEl.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

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

  const content = (
    <div className="space-y-6">
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

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          ref={popupRef}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border bg-background p-6 max-h-[80vh] overflow-y-auto w-screen"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-textColor">Chat Settings</h1>
          </div>
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed z-50 rounded-xl border-border border-[0.5px] bg-background p-4"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-textColor">Chat Settings</h1>
        <button onClick={onClose} className="p-2 hover:bg-surface rounded-full">
          <X className="w-5 h-5 text-textColor" />
        </button>
      </div>
      {content}
    </motion.div>
  );
};
