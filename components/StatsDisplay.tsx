
"use client";

import React from 'react';

interface StyleStats {
  og_bonkgang: number;
  hung_hing: number;
  street_gang: number;
}

interface StatsDisplayProps {
  stats: StyleStats | null;
  isLoading: boolean;
  error: string | null;
}

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG bonkgang',
  hung_hing: 'Hung Hing',
  street_gang: 'Street Gang',
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, isLoading, error }) => {
  const renderContent = () => {
    // During initial app load, show loading indicator.
    if (isLoading) {
      return <p className="text-center text-gray-400">Loading stats...</p>;
    }

    // If there was an initialization error, the stats could not be loaded.
    if (error) {
      return <p className="text-center text-red-400">Stats could not be loaded.</p>;
    }

    // If loading is finished, no error, and we have stats, display them.
    if (stats) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {Object.entries(stats)
            .sort(([a], [b]) => Object.keys(styleNames).indexOf(a) - Object.keys(styleNames).indexOf(b)) // Ensure consistent order
            .map(([styleId, count]) => (
              <div key={styleId} className="p-3 bg-zinc-800 rounded-md border border-amber-400/50">
                <p className="text-amber-400 text-base sm:text-lg truncate">{styleNames[styleId] || styleId}</p>
                <p className="text-white font-bold text-2xl mt-1">{count}</p>
              </div>
            ))}
        </div>
      );
    }
    
    // Fallback if stats are null after loading without an explicit error.
    return <p className="text-center text-gray-400">Stats are currently unavailable.</p>;
  };

  return (
    <div className="w-full max-w-3xl mt-12">
      <div className="p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg">
        <h2 className="text-xl text-center text-amber-400 mb-4">
          Member Stats
        </h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default StatsDisplay;
