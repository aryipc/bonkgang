
"use client";

import React, { forwardRef, useRef, useEffect } from 'react';
import type { GenerationResult } from '@/services/geminiService';

const typeStyles: { [key: string]: { bg: string; symbol: string; text: string; } } = {
  Grass: { bg: 'bg-[#78c850]', symbol: '🌿', text: 'text-white' },
  Fire: { bg: 'bg-[#f08030]', symbol: '🔥', text: 'text-white' },
  Water: { bg: 'bg-[#6890f0]', symbol: '💧', text: 'text-white' },
  Lightning: { bg: 'bg-[#f8d030]', symbol: '⚡', text: 'text-black' },
  Psychic: { bg: 'bg-[#f85888]', symbol: '👁️', text: 'text-white' },
  Fighting: { bg: 'bg-[#c03028]', symbol: '💥', text: 'text-white' },
  Colorless: { bg: 'bg-[#a8a878]', symbol: '⭐', text: 'text-white' },
  Darkness: { bg: 'bg-[#705848]', symbol: '🌙', text: 'text-white' },
  Metal: { bg: 'bg-[#b8b8d0]', symbol: '🔩', text: 'text-black' },
  Dragon: { bg: 'bg-[#7038f8]', symbol: '🐉', text: 'text-white' },
  Fairy: { bg: 'bg-[#ee99ac]', symbol: '✨', text: 'text-white' },
  default: { bg: 'bg-gray-400', symbol: '❓', text: 'text-black' },
};

interface PokemonCardProps extends GenerationResult {
    isCapturing?: boolean;
    onArtworkLoad: () => void;
}

const PokemonCard = forwardRef<HTMLDivElement, PokemonCardProps>(({ cardData, artworkUrl, isCapturing, onArtworkLoad }, ref) => {
    const {
        pokemon_name,
        hp,
        pokemon_type,
        attack_1_name,
        attack_1_description,
        attack_1_damage,
        pokedex_entry
    } = cardData;

    const style = typeStyles[pokemon_type] || typeStyles.default;
    const imageRef = useRef<HTMLImageElement>(null);

    // This effect handles cases where the image loads from cache before the onLoad event listener is attached.
    useEffect(() => {
        const imgElement = imageRef.current;
        // Check if the image element exists, has a src, and is already 'complete'.
        // The 'complete' property is true if the browser has finished fetching the image.
        if (imgElement?.complete && artworkUrl) {
            onArtworkLoad();
        }
    }, [artworkUrl, onArtworkLoad]);
    
    // Conditionally apply a static background during capture to prevent animation bugs.
    const artworkContainerClass = `mx-[10px] mt-1 border-[5px] border-card-b-gold rounded-lg overflow-hidden h-[210px] ${isCapturing ? 'bg-gray-200' : 'holo-background'}`;

    return (
        <div ref={ref} className="w-[375px] h-[525px] p-[10px] bg-pokemon-yellow font-sans flex flex-col justify-between border-[6px] border-pokemon-blue rounded-[20px] text-black overflow-hidden">
            {/* Top Section Wrapper */}
            <div>
                {/* Header */}
                <div className="flex justify-between items-baseline px-2 pt-1 flex-shrink-0">
                    <h2 className="font-extrabold" style={{fontFamily: "'Press Start 2P', cursive", fontSize: '20px'}}>{pokemon_name}</h2>
                    <div className="flex items-center">
                        <span className="font-bold mr-1" style={{fontSize: '15px'}}>{hp} HP</span>
                        <div className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center text-sm`}>
                            {style.symbol}
                        </div>
                    </div>
                </div>

                {/* Artwork */}
                <div className={artworkContainerClass}>
                    {artworkUrl && (
                        <img
                            ref={imageRef}
                            src={artworkUrl}
                            alt={`Artwork for ${pokemon_name}`}
                            onLoad={onArtworkLoad}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Illustrator credit */}
                <p className="text-right mr-3 mt-1 flex-shrink-0 italic" style={{fontSize: '10px'}}>Illus. Google/Imagen 3</p>
            </div>

            {/* Bottom Section Wrapper */}
            <div>
                {/* Attacks Section */}
                <div className="mx-[10px] mt-1 p-3 border-[5px] border-card-b-gold rounded-lg bg-[#fdf2d4] flex flex-col gap-1 flex-shrink-0">
                    <div className="attack">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center text-sm`}>{style.symbol}</div>
                                <h3 className="font-bold" style={{fontSize: '20px'}}>{attack_1_name}</h3>
                            </div>
                            <span className="font-bold" style={{fontSize: '24px'}}>{attack_1_damage}</span>
                        </div>
                        <p className="leading-tight mt-1" style={{fontSize: '13px'}}>
                            {attack_1_description}
                        </p>
                    </div>

                    {/* Pokédex Entry */}
                    <div className="mt-2 pt-2 border-t-2 border-dotted border-card-b-gold">
                        <p className="italic leading-tight" style={{fontSize: '12px'}}>
                           {pokedex_entry}
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="text-center pb-1 flex-shrink-0">
                    <p className="font-mono" style={{fontSize: '9px'}}>&copy;2024 Pokémon Card Generator</p>
                </div>
            </div>
        </div>
    );
});

PokemonCard.displayName = 'PokemonCard';
export default PokemonCard;
