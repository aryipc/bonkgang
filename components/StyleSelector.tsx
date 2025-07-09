
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
            <h2 id="style-label" className="text-xl text-center text-amber-400">Choose a Style</h2>
            <div className="grid grid-cols-3 gap-4 w-full">
                {styles.map(style => (
                    <button
                        key={style.id}
                        role="radio"
                        aria-checked={selectedStyle === style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        disabled={isLoading}
                        className={`p-3 text-sm rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedStyle === style.id 
                                ? 'bg-amber-400 border-black text-black font-bold shadow-[3px_3px_0px_#000]'
                                : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-zinc-600 active:scale-95'
                        }`}
                    >
                        {style.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StyleSelector;