
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-400">
        LetsBonkGang Generator
      </h1>
      <p className="text-gray-300 mt-2 text-xs sm:text-sm">
        Upload an image to create your own Bonk Gang character
      </p>
    </header>
  );
};

export default Header;