"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Loader from './Loader';

interface ImageDisplayProps {
  artworkUrl: string | null;
=======
import React, { useState } from 'react';
import Loader from './Loader';
import InstructionModal from './InstructionModal';

interface PromptDisplayProps {
  prompt: string | null;
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
<<<<<<< HEAD
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm">Your generated character will appear here.</p>
  </div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ artworkUrl, isLoading }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // When a new image is being generated, reset the loaded state.
  useEffect(() => {
    if (isLoading || !artworkUrl) {
      setIsImageLoaded(false);
    }
  }, [isLoading, artworkUrl]);

  return (
    <div className="w-full p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg flex flex-col gap-4 h-full animate-fadeInUp">
      <h2 className="text-xl text-center text-amber-400 uppercase">Gang Member Image</h2>
      <div className="w-full aspect-square bg-zinc-950 border-2 border-amber-400 rounded-lg flex items-center justify-center overflow-hidden p-2">
        {isLoading && <Loader />}
        {!isLoading && artworkUrl && (
          <img
            src={artworkUrl}
            alt="Generated bonk gang character"
            className={`w-full h-full object-contain transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
        {!isLoading && !artworkUrl && <Placeholder />}
      </div>
       <div className="text-center h-10 flex items-center justify-center mt-auto pt-4">
        {artworkUrl && !isLoading && (
            <a
                href={artworkUrl}
                download="lets-bonk-gang-character.jpeg"
                className={`w-full px-4 py-3 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-500 active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center justify-center text-sm sm:text-base ${
                    !isImageLoaded ? '!bg-zinc-700 !text-gray-400 !shadow-none opacity-70 cursor-not-allowed' : ''
                }`}
                // Prevent click if image is not loaded
                onClick={(e) => {
                    if (!isImageLoaded) {
                        e.preventDefault();
                    }
                }}
            >
                {isImageLoaded ? 'DOWNLOAD IMAGE' : 'LOADING IMAGE...'}
            </a>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
=======
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-sm">Choose a style to see your prompt.</p>
  </div>
);

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, isLoading }) => {
  const [buttonText, setButtonText] = useState('COPY PROMPT & OPEN CHATGPT');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (prompt) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmAndRedirect = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      window.open('https://chatgpt.com/', '_blank');
      
      setIsModalOpen(false); // Close the modal

      setButtonText('PROMPT COPIED!');
      setShowConfirmation(true);

      setTimeout(() => {
        setButtonText('COPY PROMPT & OPEN CHATGPT');
        setShowConfirmation(false);
      }, 5000);
    }
  };

  return (
    <>
      <div className="w-full p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg flex flex-col gap-4 h-full animate-fadeInUp">
        <h2 className="text-xl text-center text-amber-400 uppercase">2. YOUR GENERATED PROMPT</h2>
        <div className="w-full h-full min-h-[300px] bg-zinc-950 border-2 border-amber-400 rounded-lg flex items-center justify-center overflow-y-auto p-2">
          {isLoading && <Loader />}
          {!isLoading && prompt && (
            <pre className="w-full h-full p-2 sm:p-4 text-gray-200 text-sm whitespace-pre-wrap break-words font-sans">
              {prompt}
            </pre>
          )}
          {!isLoading && !prompt && <Placeholder />}
        </div>
        <div className="text-center mt-auto pt-4">
          {prompt && !isLoading && (
              <div className="flex flex-col items-center gap-3">
                  <button
                      onClick={handleOpenModal}
                      className={`w-full px-4 py-3 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-500 active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center justify-center text-sm sm:text-base`}
                  >
                      {buttonText}
                  </button>
                  {showConfirmation && (
                      <p className="text-xs text-amber-200 animate-fadeInUp">
                          Prompt copied to clipboard!
                      </p>
                  )}
              </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <InstructionModal 
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAndRedirect}
        />
      )}
    </>
  );
};

export default PromptDisplay;
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
