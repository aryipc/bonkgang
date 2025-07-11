"use client";

import React, { useState, useCallback } from 'react';
import { analyzeImage } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import PromptDisplay from '@/components/ImageDisplay';
import FooterLinks from '@/components/FooterLinks';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOutputVisible, setIsOutputVisible] = useState<boolean>(false);

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGeneratedPrompt(null);
    setError(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!inputImage) {
        setError("Please upload an image first.");
        return;
    };

    setIsOutputVisible(true);
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt(null);

    try {
      // Step 1: Analyze the image to get a description.
      const analysisResult = await analyzeImage(inputImage);
      setGeneratedPrompt(analysisResult.description);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate prompt. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputImage]);

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <main className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className={isOutputVisible ? 'w-full' : 'md:col-span-2 w-full flex justify-center'}>
              <div className={isOutputVisible ? 'w-full' : 'w-full max-w-xl'}>
                <PromptInput
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  error={error}
                  inputImage={inputImage}
                  setInputImage={handleSetInputImage}
                />
              </div>
          </div>

          {isOutputVisible && (
            <PromptDisplay
              prompt={generatedPrompt}
              isLoading={isLoading}
            />
          )}
        </main>
        <FooterLinks />
        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
