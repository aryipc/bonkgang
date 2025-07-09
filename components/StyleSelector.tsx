
"use client";

import React from 'react';

const styles = [
    { id: 'og_bonkgang', name: 'OG bonkgang' },
    { id: 'hung_hing', name: 'Hung Hing' },
    { id: 'street_gang', name: 'Street Gang' },
];

interface StyleSelectorProps {
    selectedStyle: string;
    setSelectedStyle: (style: string) => void;
    isLoading: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, setSelectedStyle, isLoading }) => {
    return (
        <div className="w-full max-w-lg flex flex-col items-center gap-3 my-6" role="radiogroup" aria-labelledby="style-label">
            <h2 id="style-label" className="text-xl text-center text-yellow-300">Choose a Style</h2>
            <div className="grid grid-cols-3 gap-4 w-full">
                {styles.map(style => (
                    <button
                        key={style.id}
                        role="radio"
                        aria-checked={selectedStyle === style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        disabled={isLoading}
                        className={`p-3 text-sm rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] focus:ring-pink-500 ${
                            selectedStyle === style.id 
                                ? 'bg-cyan-500 border-cyan-300 text-white font-bold shadow-lg shadow-cyan-500/50'
                                : 'bg-[#2c2c54] border-purple-500 text-cyan-300 hover:bg-purple-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {style.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StyleSelector;