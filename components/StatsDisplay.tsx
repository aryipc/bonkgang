<<<<<<< HEAD

=======
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
"use client";

import React from 'react';

<<<<<<< HEAD
interface StyleStats {
  og_bonkgang: number;
  hung_hing: number;
  street_gang: number;
}

interface StatsDisplayProps {
  stats: StyleStats | null;
  isLoading: boolean;
}

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG BonkGang',
=======
const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG bonkgang',
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
  hung_hing: 'Hung Hing',
  street_gang: 'Street Gang',
};

<<<<<<< HEAD
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
=======
const StatsDisplay: React.FC = () => {
  const stats = {
    og_bonkgang: 0,
    hung_hing: 0,
    street_gang: 0,
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
  };

  return (
    <div className="w-full max-w-3xl mt-12">
      <div className="p-4 bg-zinc-900 border-2 border-amber-400 rounded-lg">
        <h2 className="text-xl text-center text-amber-400 mb-4">
          Member Stats
        </h2>
<<<<<<< HEAD
        {renderContent()}
=======
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
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
      </div>
    </div>
  );
};

export default StatsDisplay;