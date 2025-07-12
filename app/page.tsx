
"use client";

import React, { useState, useEffect, useCallback } from 'react';

// Components
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import StyleSelector from '@/components/StyleSelector';
import StatsDisplay from '@/components/StatsDisplay';
import ParticleBackground from '@/components/ParticleBackground';
import FooterLinks from '@/components/FooterLinks';
import TestControls from '@/components/TestControls';

// Services & Types
import {
  analyzeImage,
  generateBonkImage,
  getStats,
  type StyleStats,
  type IpStatus,
  type ImageAnalysisResult,
  type ImageGenerationResult,
} from '@/services/geminiService';


async function getIpStatus(): Promise<IpStatus> {
    const response = await fetch('/api/ip-status');
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    const data = await response.json();
    // Provide a default structure if the response is not as expected
    return {
        totalSubmissions: data.totalSubmissions ?? 0,
        submittedGangs: data.submittedGangs ?? [],
    };
}


export default function HomePage() {
  // Data state
  const [stats, setStats] = useState<StyleStats | null>(null);
  const [ipStatus, setIpStatus] = useState<IpStatus>({ totalSubmissions: 0, submittedGangs: [] });

  // UI state
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  // Process state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerationAttempted, setIsGenerationAttempted] = useState(false);

  // Test controls state
  const [isResettingIp, setIsResettingIp] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [statsData, ipStatusData] = await Promise.all([
        getStats(),
        getIpStatus()
      ]);
      setStats(statsData);
      setIpStatus(ipStatusData);
    } catch (e: any) {
      console.error("Failed to fetch initial data:", e);
      setError(`Failed to load initial data. ${e.message}. Please try refreshing the page.`);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (inputImage) {
      setIsGenerationAttempted(false);
      setArtworkUrl(null);
      setError(null);
    }
  }, [inputImage]);

  const handleGenerate = async (isTest: boolean = false) => {
    if (!inputImage) {
      setError("Please upload an image first.");
      return;
    }
    if (!selectedStyle) {
      setError("Please select a gang style.");
      return;
    }

    setIsGenerating(true);
    setArtworkUrl(null);
    setError(null);
    setIsGenerationAttempted(true);
    if (testFeedback) setTestFeedback(null);

    try {
      const analysisResult: ImageAnalysisResult = await analyzeImage(inputImage);
      
      const weaponId = isTest ? 'balloon_bat' : undefined;
      const generationResult: ImageGenerationResult = await generateBonkImage(
          analysisResult.description,
          selectedStyle,
          analysisResult.itemCount,
          weaponId
      );

      setArtworkUrl(generationResult.artworkUrl);
      
      if (!isTest && generationResult.newStats && generationResult.newIpStatus) {
        setStats(generationResult.newStats);
        setIpStatus(generationResult.newIpStatus);
      } else if (isTest) {
        setTestFeedback("Test generation successful!");
      }

    } catch (err: any) {
      console.error("Generation process failed:", err);
      const errorMessage = err.message || "An unknown error occurred during generation.";
      setError(errorMessage);
      if (isTest) {
        setTestFeedback(`Test generation failed: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetIp = async () => {
    setIsResettingIp(true);
    setTestFeedback(null);
    try {
      const response = await fetch('/api/reset-ip', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to reset IP.');
      setTestFeedback(result.message);
      await fetchInitialData(); // Refresh data after reset
    } catch (err: any) {
      setTestFeedback(`Failed to reset IP: ${err.message}`);
    } finally {
      setIsResettingIp(false);
    }
  };

  return (
    <>
      <ParticleBackground />
      <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative z-10 font-sans">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6">
          <Header />

          <main className="w-full flex flex-col items-center gap-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <PromptInput
                onGenerate={() => handleGenerate(false)}
                isLoading={isGenerating}
                error={error}
                inputImage={inputImage}
                setInputImage={setInputImage}
                totalSubmissions={ipStatus.totalSubmissions}
                selectedStyle={selectedStyle}
                isGenerationAttempted={isGenerationAttempted}
              />
              <ImageDisplay
                artworkUrl={artworkUrl}
                isLoading={isGenerating}
              />
            </div>
            
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
              isLoading={isGenerating}
              submittedGangs={ipStatus.submittedGangs}
            />

            <StatsDisplay stats={stats} isLoading={isInitialLoading} />
            
            <TestControls
              onTestGenerate={() => handleGenerate(true)}
              onResetIp={handleResetIp}
              isGenerating={isGenerating}
              isResetting={isResettingIp}
              feedback={testFeedback}
              hasImage={!!inputImage}
            />
          </main>
          
          <FooterLinks />
        </div>
      </div>
    </>
  );
}
