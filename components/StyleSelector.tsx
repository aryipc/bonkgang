"use client";

import React from 'react';

const gangs = [
    { 
        id: 'og_bonkgang', 
        name: 'OG BonkGang', 
        description: 'The original crew. Masters of the bat, they keep it classic and chaotic. Fun, expressive, and always ready for a bonk.' 
    },
    { 
        id: 'hung_hing', 
        name: 'Hung Hing', 
        description: "Hong Kong's ruthless streets breed these cleaver-wielding gangsters, draped in dragon tattoos and chaos. They are commonly called 古惑仔" 
    },
    { 
        id: 'street_gang', 
        name: 'Street Gang', 
        description: 'Straight from the American block. Bold, gritty, and armed to the teeth. They live by the code of the streets, inspired by 90s comic book action.' 
    },
];

interface StyleSelectorProps {
    selectedStyle: string | null;
    onStyleSelect: (style: string) => void;
    isLoading: boolean;
    submittedGangs: string[];
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleSelect, isLoading, submittedGangs }) => {
    const selectedGang = gangs.find(g => g.id === selectedStyle);
    
    return (
        <div className="w-full max-w-lg flex flex-col items-center gap-3 my-6" role="radiogroup" aria-labelledby="gang-label">
            <h2 id="gang-label" className="text-xl text-center text-amber-400">Choose a Gang</h2>
            <div className="grid grid-cols-3 gap-4 w-full">
                {gangs.map(gang => {
                    const isSubmitted = submittedGangs.includes(gang.id);
                    return (
                        <button
                            key={gang.id}
                            role="radio"
                            aria-checked={selectedStyle === gang.id}
                            onClick={() => onStyleSelect(gang.id)}
                            disabled={isLoading || isSubmitted}
                            className={`p-3 text-sm rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-amber-400 ${
                                isSubmitted
                                    ? 'bg-zinc-700 border-zinc-600 text-gray-500 cursor-not-allowed'
                                : selectedStyle === gang.id 
                                    ? 'bg-amber-400 border-black text-black font-bold shadow-[4px_4px_0px_#000]'
                                    : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-zinc-600'
                            } enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none disabled:opacity-70`}
                        >
                            {gang.name}
                        </button>
                    )
                })}
            </div>
            {selectedGang && (
                <div
                    key={selectedGang.id} // Re-triggers animation on change
                    className="mt-4 w-full p-4 bg-zinc-950 border border-amber-400/30 rounded-lg text-center animate-fadeInUp"
                    aria-live="polite" // Announce changes to screen readers
                >
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedGang.description}</p>
                </div>
            )}
        </div>
    );
};

export default StyleSelector;