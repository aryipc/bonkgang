"use client";

import React from 'react';
import Link from 'next/link';

interface StyleStats {
  og_bonkgang: number;
  ghz: number;
  street_gang: number;
}

interface StatsDisplayProps {
  stats: StyleStats | null;
  isLoading: boolean;
}

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG BonkGang',
  ghz: 'GHZ',
  street_gang: 'Street Gang',
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, isLoading }) => {
  const renderContent = () => {
    if (isLoading && !stats) {
      return <p className="text-center text-gray-400">Loading stats...</p>;
    }

    if (stats) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {Object.entries(stats)
            .sort(([a], [b]) => Object.keys(styleNames).indexOf(a) - Object.keys(styleNames).indexOf(b))
            .map(([styleId, count]) => (
              <div key={styleId} className="p-3 bg-zinc-800 rounded-md border border-amber-400/50">
                <p className="text-amber-400 text-base sm:text-lg truncate">{styleNames[styleId] || styleId}</p>
                <p className="text-white font-bold text-2xl mt-1">{count}</p>
              </div>
            ))}
        </div>
      );
    }
    
    return <p className="text-center text-red-400">Stats could not be loaded.</p>;
  };

  return (
    <div className="w-full max-w-3xl mt-12">
       <Link
        href="/roll-of-members"
        className="block p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg transition-all duration-300 ease-in-out hover:border-amber-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-400/10 cursor-pointer"
        aria-label="View the Roll of Members gallery"
      >
        <h2 className="text-xl text-center text-amber-400 mb-4">
          Member Stats
        </h2>
        {renderContent()}
      </Link>
    </div>
  );
};

export default StatsDisplay;