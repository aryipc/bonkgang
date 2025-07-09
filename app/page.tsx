"use client";

import React, { useState, useCallback } from 'react';
import { analyzeImage, generateBonkImage, ImageGenerationResult } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('bonkgang');

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGeneratedPrompt(null);
    setGenerationResult(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!inputImage) {
        setError("Please upload an image first.");
        return;
    };

    setIsAnalyzing(true);
    setError(null);
    setGenerationResult(null);
    setGeneratedPrompt(null);

    try {
      const result = await analyzeImage(inputImage);
      setGeneratedPrompt(result.description);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to analyze image. ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputImage]);

  const handleGenerate = useCallback(async () => {
    if (!generatedPrompt) {
        setError("Please analyze an image to generate a prompt first.");
        return;
    };

    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);

    try {
      const result = await generateBonkImage(generatedPrompt, selectedStyle);
      setGenerationResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [generatedPrompt, selectedStyle]);

  return (
    <div className="bg-[#1a1a2e] min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <main className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <PromptInput
            onAnalyze={handleAnalyze}
            onGenerate={handleGenerate}
            isAnalyzing={isAnalyzing}
            isGenerating={isGenerating}
            error={error}
            inputImage={inputImage}
            setInputImage={handleSetInputImage}
            generatedPrompt={generatedPrompt}
            setGeneratedPrompt={setGeneratedPrompt}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />
          <ImageDisplay
            artworkUrl={generationResult?.artworkUrl ?? null}
            isLoading={isGenerating}
          />
        </main>
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Powered by Google Gemini & Imagen</p>
          <p>LetsBonkGang Generator &copy; 2024</p>
        </footer>
      </div>
    </div>
  );
}