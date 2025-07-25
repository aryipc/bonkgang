
"use client";

import React, { useState, useEffect } from 'react';
import Loader from './Loader';

interface ImageDisplayProps {
  artworkUrl: string | null;
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
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
