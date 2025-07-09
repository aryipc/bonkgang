
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-300" style={{ textShadow: '3px 3px 0px #e040fb' }}>
        Pokémon Card Generator
      </h1>
      <p className="text-yellow-300 mt-2 text-xs sm:text-sm">
        Turn any image into a Pokémon Card
      </p>
    </header>
  );
};

export default Header;