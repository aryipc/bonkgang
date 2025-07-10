
"use client";

import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeInUp"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-zinc-900 border-2 border-amber-400 rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md text-center"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <p id="modal-title" className="text-white text-base sm:text-lg leading-relaxed mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="px-8 py-2 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] enabled:hover:bg-amber-500 enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none"
          aria-label="Close modal"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
