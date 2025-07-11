
"use client";

import React from 'react';

interface TestControlsProps {
  onTestGenerate: () => void;
  onResetIp: () => void;
  isGenerating: boolean;
  isResetting: boolean;
  feedback: string | null;
}

const TestControls: React.FC<TestControlsProps> = ({ onTestGenerate, onResetIp, isGenerating, isResetting, feedback }) => {
  const hasFeedbackFailed = feedback?.toLowerCase().includes('failed');
  
  return (
    <div className="w-full max-w-3xl mt-8">
      <div className="p-4 bg-zinc-900 border-2 border-dashed border-red-500/80 rounded-lg">
        <h2 className="text-xl text-center text-red-400/90 mb-4 font-normal tracking-wider">
          Dev Test Controls
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onTestGenerate}
            disabled={isGenerating || isResetting}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md transition-colors hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'GENERATING...' : 'Test Balloon Bat'}
          </button>
          <button
            onClick={onResetIp}
            disabled={isGenerating || isResetting}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-md transition-colors hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isResetting ? 'RESETTING...' : 'Reset IP Status'}
          </button>
        </div>
        {feedback && (
          <div className="mt-4 text-center p-2 rounded-md bg-zinc-800 border border-zinc-700">
            <p className={`text-sm ${hasFeedbackFailed ? 'text-red-400' : 'text-green-400'}`}>
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestControls;
