"use client";

import React, { useCallback, useState, useEffect } from 'react';

interface PromptInputProps {
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  inputImage: File | null;
  setInputImage: (file: File | null) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, error, inputImage, setInputImage }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (inputImage) {
      const objectUrl = URL.createObjectURL(inputImage);
      setPreviewUrl(objectUrl);
      
      // Free memory when the component is unmounted or image changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [inputImage]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInputImage(e.target.files[0]);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoading && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setInputImage(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [setInputImage, isLoading]);

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const getButtonText = () => {
      if (isLoading) return 'SUBMITTING...';
      return 'SUBMIT';
  }

  return (
    <div className="w-full p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center text-amber-400 uppercase">Submit Your Image</h2>
      
      <label 
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full aspect-square bg-zinc-950 border-2 border-amber-400 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:bg-zinc-900 transition-colors"
      >
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} disabled={isLoading} />
        {previewUrl ? (
          <img src={previewUrl} alt="Input preview" className="max-w-full max-h-full object-contain rounded-lg" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs sm:text-sm">Drop an image here or click to get started</p>
          </div>
        )}
      </label>

      <button
        onClick={onGenerate}
        disabled={isLoading || !inputImage}
        className="w-full mt-auto px-4 py-3 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] enabled:hover:bg-amber-500 enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
      >
        {getButtonText()}
      </button>
      {error && (
        <div className="mt-2 p-3 bg-red-900/50 border border-red-400 rounded-md" role="alert">
          <p className="text-center text-red-300 text-xs sm:text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptInput;