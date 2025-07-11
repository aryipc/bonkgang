
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-400 uppercase tracking-tight leading-snug">
        LetsBonkGang Official <br /> prompt page
      </h1>
      <p className="text-gray-200 mt-3 text-sm sm:text-base">
        Upload your image and get prompt
      </p>
    </header>
  );
};

export default Header;
