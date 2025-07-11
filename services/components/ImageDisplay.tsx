"use client";

import React, { useState } from 'react';
import Loader from './Loader';

interface PromptDisplayProps {
  prompt: string | null;
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-sm">Upload an image and choose a style.</p>
    <p className="text-sm">Your generated prompt will appear here.</p>
  </div>
);

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, isLoading }) => {
  const [buttonText, setButtonText] = useState('COPY PROMPT & OPEN CHATGPT');
  const [showInstruction, setShowInstruction] = useState(false);

  const handleUseOnGpt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      window.open('https://chatgpt.com/', '_blank');
      
      setButtonText('PROMPT COPIED!');
      setShowInstruction(true);

      setTimeout(() => {
        setButtonText('COPY PROMPT & OPEN CHATGPT');
        setShowInstruction(false);
      }, 5000);
    }
  };

  return (
    <div className="w-full p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg flex flex-col gap-4 h-full animate-fadeInUp">
      <h2 className="text-xl text-center text-amber-400 uppercase">3. Your Generated Prompt</h2>
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
                    onClick={handleUseOnGpt}
                    className={`w-full px-4 py-3 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-500 active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center justify-center text-sm sm:text-base`}
                >
                    {buttonText}
                </button>
                {showInstruction && (
                     <p className="text-xs text-amber-200 animate-fadeInUp">
                        Paste the prompt, then drag your image from the left into ChatGPT.
                    </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default PromptDisplay;
