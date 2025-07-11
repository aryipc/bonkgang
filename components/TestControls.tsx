"use client";

import React from 'react';

interface TestControlsProps {
  onTestGenerate: () => void;
  onResetIp: () => void;
  onRefreshIp: () => void;
  isGenerating: boolean;
  isResetting: boolean;
  isRefreshing: boolean;
  feedback: string | null;
  hasImage: boolean;
}

const TestControls: React.FC<TestControlsProps> = ({ onTestGenerate, onResetIp, onRefreshIp, isGenerating, isResetting, isRefreshing, feedback, hasImage }) => {
  const feedbackIsError = feedback?.toLowerCase().includes('failed') || feedback?.toLowerCase().includes('please upload');
  
  return (
    <div className="w-full max-w-3xl mt-8">
      <div className="p-4 bg-zinc-900 border-2 border-dashed border-red-500/80 rounded-lg">
        <h2 className="text-xl text-center text-red-400/90 mb-4 font-normal tracking-wider">
          Dev Test Controls
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <button
            onClick={onTestGenerate}
            disabled={isGenerating || isResetting || isRefreshing || !hasImage}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md transition-colors hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
            title={!hasImage ? "Please upload an image first to use this test." : "Test generation with balloon bat weapon"}
          >
            {isGenerating ? 'TESTING...' : 'Test Balloon Bat'}
          </button>
          <button
            onClick={onRefreshIp}
            disabled={isGenerating || isResetting || isRefreshing}
            className="px-4 py-2 bg-purple-600 text-white font-bold rounded-md transition-colors hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'REFRESHING...' : 'Refresh IP Status'}
          </button>
          <button
            onClick={onResetIp}
            disabled={isGenerating || isResetting || isRefreshing}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-md transition-colors hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isResetting ? 'RESETTING...' : 'Reset IP Limit'}
          </button>
        </div>
        {feedback && (
          <div className="mt-4 text-center p-2 rounded-md bg-zinc-800 border border-zinc-700">
            <p className={`text-sm ${feedbackIsError ? 'text-red-400' : 'text-green-400'}`}>
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestControls;
