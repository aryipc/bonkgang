
"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import Loader from './Loader';
import PokemonCard from './PokemonCard';
import DownloadWarningModal from './DownloadWarningModal';
import type { GenerationResult } from '@/services/geminiService';

interface ImageDisplayProps {
  generationResult: GenerationResult | null;
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm">Your generated Pokémon card will appear here.</p>
  </div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ generationResult, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasShownIosWarning, setHasShownIosWarning] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // When a new card is generated, reset the artwork loaded and warning states.
  useEffect(() => {
    setIsArtworkLoaded(false);
    setHasShownIosWarning(false);
    setIsWarningModalOpen(false);
  }, [generationResult]);

  // This callback is passed to PokemonCard and triggered by the artwork's `onLoad` event.
  const handleArtworkLoad = useCallback(() => {
    setIsArtworkLoaded(true);
  }, []);

  const captureAndDownload = useCallback(async () => {
    const node = cardRef.current;
    if (node === null || !isArtworkLoaded || !generationResult) {
      console.warn("Download cancelled: Card element not ready or data missing.");
      return;
    }

    setIsCapturing(true);

    try {
      // Small delay to ensure styles are applied and fonts are ready.
      await new Promise(resolve => setTimeout(resolve, 100));
      await document.fonts.ready;

      const dataUrl = await toPng(node, { 
        pixelRatio: 2,
        cacheBust: true,
      });
      
      const name = generationResult.cardData.pokemon_name || 'pokemon-card';
      const fileName = `${name.toLowerCase().replace(/\s/g, '-')}.png`;
      
      const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      if (isDesktop) {
          // DESKTOP: Direct download.
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          // MOBILE: Use Web Share API if available, with a fallback to opening in a new tab.
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Pokémon Card - ${generationResult.cardData.pokemon_name}`,
                text: 'Check out the custom Pokémon card I generated!',
              });
            } else {
              // If sharing is not supported, throw an error to trigger the catch block fallback.
              throw new Error('Web Share API not supported or cannot share these files.');
            }
          } catch (err: any) {
            // If the user cancels the share sheet, the promise rejects with an "AbortError".
            // We should not treat this as a failure that requires a fallback.
            if (err?.name === 'AbortError') {
              console.log('Share action was cancelled by the user.');
            } else {
              console.warn('Web Share failed, falling back to opening in a new tab:', err);
              const newTab = window.open(dataUrl, '_blank');
              if (!newTab) {
                alert("Your browser blocked the pop-up. Please enable pop-ups for this site to view and save your card.");
              }
            }
          }
      }
    } catch (err: any) {
        console.error('Failed to capture or download card image:', err);
        alert('Sorry, failed to download image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [generationResult, isArtworkLoaded]);

  const handleDownload = useCallback(async () => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // On iOS, show a one-time warning before the first download attempt.
    if (isIos && !hasShownIosWarning) {
        setIsWarningModalOpen(true);
        return; // Stop here; the user must dismiss the modal and click again.
    }
    
    // For all other cases, or subsequent clicks on iOS, proceed to download.
    await captureAndDownload();
  }, [captureAndDownload, hasShownIosWarning]);

  const handleCloseWarning = () => {
    setIsWarningModalOpen(false);
    // Mark warning as shown so it doesn't appear again for this card
    setHasShownIosWarning(true); 
  };

  return (
    <div className="w-full p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg flex flex-col gap-4 h-full">
      <DownloadWarningModal isOpen={isWarningModalOpen} onClose={handleCloseWarning} />
      
      <h2 className="text-xl text-center text-yellow-300">Output</h2>
      <div className="w-full min-h-[60vh] md:min-h-0 bg-[#131325] border-2 border-cyan-400 rounded-lg flex items-center justify-center overflow-auto p-2">
        {isLoading && <Loader />}
        {!isLoading && generationResult && (
          <div className="w-full max-w-sm mx-auto flex justify-center">
             <PokemonCard 
                ref={cardRef} 
                {...generationResult} 
                isCapturing={isCapturing}
                onArtworkLoad={handleArtworkLoad}
             />
          </div>
        )}
        {!isLoading && !generationResult && <Placeholder />}
      </div>
       <div className="text-center h-10 flex items-center justify-center mt-auto pt-4">
        {generationResult && !isLoading && (
            <button
                onClick={handleDownload}
                disabled={!isArtworkLoaded || isCapturing}
                className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out enabled:hover:bg-green-700 enabled:active:scale-95 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
                {isCapturing ? 'PREPARING IMAGE...' : (isArtworkLoaded ? 'DOWNLOAD CARD' : 'LOADING ARTWORK...')}
            </button>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
