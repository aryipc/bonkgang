
"use client";

import React from 'react';

interface StyleStats {
  og_bonkgang: number;
  hung_hing: number;
  street_gang: number;
}

interface StatsDisplayProps {
  stats: StyleStats | null;
}

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG bonkgang',
  hung_hing: 'Hung Hing',
  street_gang: 'Street Gang',
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="w-full max-w-3xl mt-12">
      <div className="p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg">
        <h2 className="text-xl text-center text-yellow-300 mb-4" style={{ textShadow: '2px 2px 0px #e040fb' }}>
          Generation Stats
        </h2>
        {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {Object.entries(stats)
                .sort(([a], [b]) => Object.keys(styleNames).indexOf(a) - Object.keys(styleNames).indexOf(b)) // Ensure consistent order
                .map(([styleId, count]) => (
                <div key={styleId} className="p-3 bg-[#1a1a2e] rounded-md border border-cyan-400/50">
                    <p className="text-cyan-300 text-base sm:text-lg truncate">{styleNames[styleId] || styleId}</p>
                    <p className="text-white font-bold text-2xl mt-1">{count}</p>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-400">Loading stats...</p>
        )}
      </div>
    </div>
  );
};

export default StatsDisplay;