import { ReactNode } from "react";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function PopupModal({ isOpen, onClose, children }: PopupModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-backgroundContrast/20 z-50 cursor-default"
      onClick={onClose}
    >
      <div 
        className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer"
        >
          ✖
        </button>
        
        {children}
      </div>
    </div>
  );
}
