
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage, generateBonkImage, getStats, ImageGenerationResult, StyleStats } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';
import FooterLinks from '@/components/FooterLinks';
import InfoModal from '@/components/InfoModal';

interface IpStatus {
  submittedGangs: string[];
  totalSubmissions: number;
}

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [stats, setStats] = useState<StyleStats | null>(null);
  const [isOutputVisible, setIsOutputVisible] = useState<boolean>(false);
  const [ipStatus, setIpStatus] = useState<IpStatus | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isGenerationAttempted, setIsGenerationAttempted] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      setError(null);
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
        setError(`Initialization failed. ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSetInputImage = (file: File | null) => {
    setInputImage(file);
    setGenerationResult(null);
    setError(null);
    // Reset generation attempt flag to allow a new submission,
    // but only if the user has not already reached the limit of 2.
    // This makes the submit button lock permanent once the limit is hit.
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
    // Reset generation attempt flag to allow a new submission,
    // but only if the user has not already reached the limit of 2.
    // This makes the submit button lock permanent once the limit is hit.
    if ((ipStatus?.totalSubmissions ?? 0) < 2) {
      setIsGenerationAttempted(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!inputImage) {
        setError("Please upload an image first.");
        return;
    };

    if (!selectedStyle) {
        setError("Please choose a gang first.");
        return;
    }

    if (ipStatus && ipStatus.totalSubmissions >= 2) {
      setError("You have reached the maximum number of generations (2).");
      return;
    }

    setIsGenerationAttempted(true); // Disable button immediately
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
      
      // Step 3: Refresh stats and IP status in parallel after a successful generation.
      const [statsRes, statusRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/ip-status')
      ]);

      if (statsRes.ok) {
          setStats(await statsRes.json());
      } else {
          console.error('Failed to refresh stats after generation.');
      }

      if (statusRes.ok) {
        setIpStatus(await statusRes.json());
      } else {
        console.error('Failed to refresh IP status after generation.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputImage, selectedStyle, ipStatus]);

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
       <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        message="You can join a maximum of two gangs. You cannot rejoin a gang you have already joined."
      />
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <StyleSelector 
          selectedStyle={selectedStyle}
          onStyleSelect={handleStyleSelect}
          isLoading={isLoading}
          error={error}
          submittedGangs={ipStatus?.submittedGangs ?? []}
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
                  totalSubmissions={ipStatus?.totalSubmissions ?? 0}
                  selectedStyle={selectedStyle}
                  isGenerationAttempted={isGenerationAttempted}
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
        <StatsDisplay stats={stats} isLoading={isLoading} error={error} />
        <FooterLinks />
        <footer className="mt-4 text-center text-xs text-gray-400">
          <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
