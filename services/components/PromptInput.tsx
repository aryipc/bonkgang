"use client";

import React, { useCallback, useState, useEffect } from 'react';

interface PromptInputProps {
  inputImage: File | null;
  setInputImage: (file: File | null) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ inputImage, setInputImage }) => {
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
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setInputImage(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [setInputImage]);

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center text-amber-400 uppercase">1. UPLOAD YOUR IMAGE</h2>
      
      <label 
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full aspect-square bg-zinc-950 border-2 border-amber-400 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:bg-zinc-900 transition-colors"
      >
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} />
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
    </div>
  );
};

export default PromptInput;
