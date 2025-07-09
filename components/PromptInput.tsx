"use client";

import React, { useCallback, useState, useEffect } from 'react';

interface PromptInputProps {
  onAnalyze: () => void;
  onGenerate: () => void;
  isAnalyzing: boolean;
  isGenerating: boolean;
  error: string | null;
  inputImage: File | null;
  setInputImage: (file: File | null) => void;
  generatedPrompt: string | null;
  setGeneratedPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

const styles = [
    { id: 'bonkgang', name: 'Bonk Gang' },
    { id: 'triad', name: '古惑仔' },
    { id: 'us_gang', name: 'US Gang' },
];

const PromptInput: React.FC<PromptInputProps> = ({ onAnalyze, onGenerate, isAnalyzing, isGenerating, error, inputImage, setInputImage, generatedPrompt, setGeneratedPrompt, selectedStyle, setSelectedStyle }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isLoading = isAnalyzing || isGenerating;

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

  const handleButtonClick = () => {
    if (generatedPrompt !== null) {
        onGenerate();
    } else {
        onAnalyze();
    }
  };

  const getButtonText = () => {
      if (isAnalyzing) return 'ANALYZING...';
      if (isGenerating) return 'GENERATING...';
      if (generatedPrompt !== null) return 'GENERATE';
      return 'ANALYZE IMAGE';
  }

  return (
    <div className="w-full p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center text-yellow-300">Input</h2>
      
      <label 
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full aspect-[3/4] bg-[#1a1a2e] border-2 border-dashed border-cyan-400 rounded-md flex items-center justify-center text-center p-2 cursor-pointer hover:bg-[#20203a] transition-colors"
      >
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} disabled={isLoading} />
        {previewUrl ? (
          <img src={previewUrl} alt="Input preview" className="max-w-full max-h-full object-contain rounded-sm" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs sm:text-sm">Drop an image here or click to get started</p>
          </div>
        )}
      </label>

      {generatedPrompt !== null && (
        <>
            <div className="flex flex-col gap-2">
                <label htmlFor="prompt-textarea" className="text-yellow-300 text-sm">Generated Prompt (edit if you like):</label>
                <textarea
                    id="prompt-textarea"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full p-2 bg-[#1a1a2e] border border-cyan-400 rounded-md text-white text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none transition-shadow"
                    rows={4}
                    disabled={isLoading}
                    aria-label="Generated Prompt"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-yellow-300 text-sm">Select Style:</label>
                <div className="grid grid-cols-3 gap-2">
                    {styles.map(style => (
                        <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            disabled={isLoading}
                            className={`p-2 text-xs rounded-md border-2 transition-all duration-200 ${
                                selectedStyle === style.id 
                                    ? 'bg-cyan-500 border-cyan-300 text-white font-bold' 
                                    : 'bg-[#1a1a2e] border-purple-500 text-cyan-300 hover:bg-purple-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-pressed={selectedStyle === style.id}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}

      <button
        onClick={handleButtonClick}
        disabled={isLoading || !inputImage}
        className="w-full mt-auto px-4 py-3 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out enabled:hover:bg-pink-700 enabled:active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
      >
        {getButtonText()}
      </button>
      {error && (
        <div className="mt-2 p-3 bg-red-900/50 border border-red-500 rounded-md" role="alert">
          <p className="text-center text-red-300 text-xs sm:text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptInput;