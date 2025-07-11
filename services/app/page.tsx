
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { generateStylePrompt } from '@/lib/prompts';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import PromptDisplay from '@/components/ImageDisplay';
import FooterLinks from '@/components/FooterLinks';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('og_bonkgang');

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGeneratedPrompt(null);
    setError(null);
  };

  useEffect(() => {
    if (inputImage && selectedStyle) {
      setIsLoading(true);
      setGeneratedPrompt(null);
      setError(null);
      
      // Simulate a brief delay to allow the loader to be perceived by the user
      setTimeout(() => {
        const prompt = generateStylePrompt(selectedStyle);
        setGeneratedPrompt(prompt);
        setIsLoading(false);
      }, 300);
    }
  }, [inputImage, selectedStyle]);


  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        {error && (
            <div className="mt-4 p-3 w-full max-w-lg bg-red-900/50 border border-red-400 rounded-md" role="alert">
            <p className="text-center text-red-300 text-sm">
                {error}
            </p>
            </div>
        )}
        <main className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column for Inputs */}
          <div className="flex flex-col gap-8">
            <PromptInput
              inputImage={inputImage}
              setInputImage={handleSetInputImage}
            />
            <StyleSelector
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
            />
          </div>

          {/* Right Column for Output */}
          <PromptDisplay
            prompt={generatedPrompt}
            isLoading={isLoading}
          />
        </main>
        <StatsDisplay />
        <FooterLinks />
        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
