"use client";

import React from 'react';

interface DownloadWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileInfoPreview: React.FC<{ sizeKB: number }> = ({ sizeKB }) => {
  return (
    <svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      {/* File Icon */}
      <g transform="translate(0, 5)">
        <path d="M0 0 H24 V36 H0 Z" fill="#4A5568" />
        <path d="M18 0 L24 6 H18 V0 Z" fill="#A0AEC0" />
        <text x="12" y="23" fontFamily="sans-serif" fontSize="9" fill="white" textAnchor="middle">PNG</text>
      </g>
      {/* Text Details */}
      <text x="32" y="18" fontFamily="sans-serif" fontSize="10" fill="#E2E8F0">PNG Image</text>
      <text x="32" y="38" fontFamily="sans-serif" fontSize="12" fill="white" fontWeight="bold">{sizeKB} KB</text>
    </svg>
  );
};

const DownloadWarningModal: React.FC<DownloadWarningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-xl p-6 max-w-sm w-full text-white text-center flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-300" style={{ textShadow: '2px 2px 0px #e040fb' }}>
          Mobile Download Notice
        </h3>
        
        <div className="text-sm sm:text-base space-y-3 text-gray-200 leading-relaxed">
           <p>On mobile, your first download might be a low-quality preview.</p>
           <p>Please check <strong className="text-cyan-300">the file size</strong> after saving.</p>
        
            <div className="flex justify-around items-start gap-4 my-4">
                {/* Correct Example */}
                <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl" role="img" aria-label="Checkmark">✅</span>
                    <div className="w-28 h-28 border-2 border-green-400 rounded-lg flex items-center justify-center bg-[#1a1a2e] p-1">
                        <FileInfoPreview sizeKB={498} />
                    </div>
                    <p className="text-xs font-bold text-green-300">CORRECT<br/>(&gt; 400KB)</p>
                </div>

                {/* Incorrect Example */}
                <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl" role="img" aria-label="Cross mark">❌</span>
                    <div className="w-28 h-28 border-2 border-red-400 rounded-lg flex items-center justify-center bg-[#1a1a2e] p-1">
                        <FileInfoPreview sizeKB={92} />
                    </div>
                    <p className="text-xs font-bold text-red-400">PREVIEW<br/>(&lt; 100KB)</p>
                </div>
            </div>

            <p>If you get the small preview, please tap <strong className="text-pink-500">'DOWNLOAD CARD'</strong> again for the full, high-quality image.</p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-3 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-pink-700 active:scale-95 text-sm sm:text-base"
          aria-label="Close download notice"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};

export default DownloadWarningModal;