"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage, generateBonkImage, getStats, ImageGenerationResult, StyleStats } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';
import FooterLinks from '@/components/FooterLinks';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('og_bonkgang');
  const [stats, setStats] = useState<StyleStats | null>(null);
  const [isOutputVisible, setIsOutputVisible] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    try {
      const fetchedStats = await getStats();
      setStats(fetchedStats);
    } catch (error) {
      console.error("UI failed to fetch stats", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGenerationResult(null);
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
    setGenerationResult(null);

    try {
      // Step 1: Analyze the image to get a description and item count.
      const analysisResult = await analyzeImage(inputImage);
      
      // Step 2: Generate the new image using the analysis result.
      const result = await generateBonkImage(analysisResult.description, selectedStyle, analysisResult.itemCount);
      setGenerationResult(result);
      
      // Step 3: Refresh stats after a successful generation.
      fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputImage, selectedStyle, fetchStats]);

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <StyleSelector 
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          isLoading={isLoading}
        />
        <main className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
            <ImageDisplay
              artworkUrl={generationResult?.artworkUrl ?? null}
              isLoading={isLoading}
            />
          )}
        </main>
        <StatsDisplay stats={stats} />
        <FooterLinks />
        <footer className="mt-4 text-center text-xs text-gray-400">
          <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}