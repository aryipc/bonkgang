
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage, generateBonkImage, ImageGenerationResult, StyleStats, IpStatus } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';
import FooterLinks from '@/components/FooterLinks';
import InfoModal from '@/components/InfoModal';
import Loader from '@/components/Loader';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null);
  
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [stats, setStats] = useState<StyleStats | null>(null);
  const [isOutputVisible, setIsOutputVisible] = useState<boolean>(false);
  const [ipStatus, setIpStatus] = useState<IpStatus | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isGenerationAttempted, setIsGenerationAttempted] = useState(false);

  const initializeApp = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);
    try {
      const [statsResponse, ipStatusResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/ip-status')
      ]);

      if (!statsResponse.ok) {
        const errorData = await statsResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load member stats.');
      }

      if (!ipStatusResponse.ok) {
        const errorData = await ipStatusResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load user status.');
      }

      const [statsData, ipStatusData] = await Promise.all([
        statsResponse.json(),
        ipStatusResponse.json()
      ]);
      
      setStats(statsData);
      setIpStatus(ipStatusData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during setup.';
      console.error("Initialization failed:", err);
      setInitError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGenerationResult(null);
    setGenerateError(null);
    if ((ipStatus?.totalSubmissions ?? 0) < 2) {
      setIsGenerationAttempted(false);
    }
  };

  const handleStyleSelect = (style: string) => {
    const hasShownInfo = sessionStorage.getItem('hasShownGangInfo') === 'true';
    if (!hasShownInfo) {
      setIsInfoModalOpen(true);
      sessionStorage.setItem('hasShownGangInfo', 'true');
    }
    setSelectedStyle(style);
    setGenerateError(null);
    if ((ipStatus?.totalSubmissions ?? 0) < 2) {
      setIsGenerationAttempted(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!inputImage) {
        setGenerateError("Please upload an image first.");
        return;
    };

    if (!selectedStyle) {
        setGenerateError("Please choose a gang first.");
        return;
    }

    if (ipStatus && ipStatus.totalSubmissions >= 2) {
      setGenerateError("You have reached the maximum number of generations (2).");
      return;
    }

    setIsGenerationAttempted(true);
    setIsOutputVisible(true);
    setIsGenerating(true);
    setGenerateError(null);
    setGenerationResult(null);

    try {
      const analysisResult = await analyzeImage(inputImage);
      const result = await generateBonkImage(analysisResult.description, selectedStyle, analysisResult.itemCount);
      
      setGenerationResult(result);
      setStats(result.newStats);
      setIpStatus(result.newIpStatus);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setGenerateError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [inputImage, selectedStyle, ipStatus]);


  // Dedicated loading UI for initialization phase
  if (isInitializing && !initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        message="You can join a maximum of two gangs. You cannot rejoin a gang you have already joined."
      />
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />

        {initError ? (
          <div className="w-full max-w-2xl mt-12 text-center">
            <div className="p-6 bg-red-900/50 border border-red-400 rounded-md" role="alert">
              <h2 className="text-xl text-red-300 mb-2 font-bold">Initialization Failed</h2>
              <p className="text-red-300">{initError}</p>
              <button
                onClick={initializeApp}
                disabled={isInitializing}
                className="mt-6 px-8 py-2 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[4px_4px_0px_#000] enabled:hover:bg-amber-500 enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isInitializing ? 'RETRYING...' : 'RETRY'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
              isLoading={isGenerating}
              submittedGangs={ipStatus?.submittedGangs ?? []}
            />
            <main className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className={isOutputVisible ? 'w-full' : 'md:col-span-2 w-full flex justify-center'}>
                  <div className={isOutputVisible ? 'w-full' : 'w-full max-w-xl'}>
                    <PromptInput
                      onGenerate={handleGenerate}
                      isLoading={isGenerating}
                      error={generateError}
                      inputImage={inputImage}
                      setInputImage={handleSetInputImage}
                      totalSubmissions={ipStatus?.totalSubmissions ?? 0}
                      selectedStyle={selectedStyle}
                      isGenerationAttempted={isGenerationAttempted}
                    />
                  </div>
              </div>

              {isOutputVisible && (
                <ImageDisplay
                  artworkUrl={generationResult?.artworkUrl ?? null}
                  isLoading={isGenerating}
                />
              )}
            </main>
            <StatsDisplay stats={stats} isLoading={isGenerating || isInitializing} />
          </>
        )}
        
        <FooterLinks />
        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
