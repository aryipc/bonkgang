"use client";

import React from 'react';

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG bonkgang',
  hung_hing: 'Hung Hing',
  street_gang: 'Street Gang',
};

const StatsDisplay: React.FC = () => {
  const stats = {
    og_bonkgang: 0,
    hung_hing: 0,
    street_gang: 0,
  };

  return (
    <div className="w-full max-w-3xl mt-12">
      <div className="p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg">
        <h2 className="text-xl text-center text-amber-400 mb-4">
          Member Stats
        </h2>
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
      </div>
    </div>
  );
};

export default StatsDisplay;