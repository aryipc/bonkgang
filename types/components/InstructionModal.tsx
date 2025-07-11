"use client";

import React from 'react';

interface InstructionModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ onClose, onConfirm }) => {
  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeInUp"
      onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-zinc-950 border-2 border-amber-400 rounded-lg p-6 sm:p-8 max-w-lg w-full shadow-lg"
        onClick={handleModalContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title" className="text-2xl font-bold text-amber-400 mb-5 text-center uppercase">Quick Guide</h3>
        <div className="text-gray-300 space-y-3 text-center leading-relaxed">
            <p>You will be redirected to ChatGPT.</p>
            <p className="font-bold text-amber-300">The style prompt will be copied to your clipboard.</p>
            <p className="mt-4">Once you are on the ChatGPT page, you'll need to:</p>
            <ol className="list-decimal list-inside text-left mx-auto max-w-sm space-y-2 mt-2 bg-zinc-900 p-4 rounded-md border border-amber-400/20">
                <li><span className="font-bold">Upload</span> your own image file.</li>
                <li><span className="font-bold">Paste</span> the prompt (Ctrl+V or Cmd+V).</li>
            </ol>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center gap-4">
          <button 
            onClick={onConfirm} 
            className="w-full sm:w-auto px-6 py-3 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-500 active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            OK, Take Me to ChatGPT
          </button>
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-2 bg-zinc-700 text-gray-200 font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-zinc-600 hover:bg-zinc-600 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
