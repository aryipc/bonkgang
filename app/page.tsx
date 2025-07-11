
"use client";

import React, { useState, useEffect } from 'react';
import { generateStylePrompt } from '@/lib/prompts';
import Header from '@/components/Header';
import PromptDisplay from '@/components/ImageDisplay';
import FooterLinks from '@/components/FooterLinks';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';

export default function Home() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('og_bonkgang');

  useEffect(() => {
    setIsLoading(true);
    setGeneratedPrompt(null);
    setError(null);
    
    const timer = setTimeout(() => {
      try {
        const prompt = generateStylePrompt(selectedStyle);
        setGeneratedPrompt(prompt);
      } catch (e) {
        setError("Failed to generate prompt. Please try a different style.");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedStyle]);


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
          <StyleSelector
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
          />

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
