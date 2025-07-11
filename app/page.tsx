
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage, generateBonkImage, ImageGenerationResult, StyleStats, IpStatus, resetIp } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';
import FooterLinks from '@/components/FooterLinks';
import InfoModal from '@/components/InfoModal';
import Loader from '@/components/Loader';
import TestControls from '@/components/TestControls';

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

  // State for dev test controls
  const [isResetting, setIsResetting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);


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
  
  const runGeneration = useCallback(async (style: string) => {
    if (!inputImage) {
      setGenerateError("Please upload an image first.");
      return;
    }

    setIsOutputVisible(true);
    setIsGenerating(true);
    setGenerateError(null);
    setTestFeedback(null);
    setGenerationResult(null);
    setIsGenerationAttempted(true);

    try {
      const analysisResult = await analyzeImage(inputImage);
      const result = await generateBonkImage(analysisResult.description, style, analysisResult.itemCount);
      
      setGenerationResult(result);
      
      // Only update stats if they are returned (i.e., not a test run)
      if (result.newStats && result.newIpStatus) {
        setStats(result.newStats);
        setIpStatus(result.newIpStatus);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setGenerateError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [inputImage]);

  const handleGenerate = useCallback(() => {
    if (!selectedStyle) {
      setGenerateError("Please choose a gang first.");
      return;
    }
    if (ipStatus && ipStatus.totalSubmissions >= 2) {
      setGenerateError("You can join a maximum of two gangs.");
      return;
    }
    runGeneration(selectedStyle);
  }, [selectedStyle, ipStatus, runGeneration]);

  const handleTestGenerate = useCallback(async () => {
    if (isGenerating || isResetting) return;
    
    setIsOutputVisible(true);
    setIsGenerating(true);
    setGenerateError(null);
    setTestFeedback(null);
    setGenerationResult(null);

    try {
        const result = await generateBonkImage(
            "An anthropomorphic dog in a dynamic pose, looking cool and stylish.",
            'og_bonkgang',
            1, // itemCount <= 1 for a single weapon
            'balloon_bat'
        );
        setGenerationResult(result);
        setTestFeedback("Test generation successful.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setTestFeedback(`Test Generation Failed. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, isResetting]);
  
  const handleResetIp = useCallback(async () => {
    if (isResetting || isGenerating) return;

    setIsResetting(true);
    setTestFeedback(null);
    setGenerateError(null);
    try {
      await resetIp();
      setTestFeedback('IP status successfully reset. You can submit again.');
      // Refresh app state to reflect the change
      await initializeApp();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setTestFeedback(`Failed to reset IP: ${errorMessage}`);
    } finally {
      setIsResetting(false);
    }
  }, [isResetting, isGenerating, initializeApp]);


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
            <TestControls
                onTestGenerate={handleTestGenerate}
                onResetIp={handleResetIp}
                isGenerating={isGenerating}
                isResetting={isResetting}
                feedback={testFeedback}
            />
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
