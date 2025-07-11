
"use client";

import React from 'react';
import Link from 'next/link';

const FooterLinks = () => {
  return (
    <div className="w-full max-w-6xl mt-8 mb-4">
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        <Link href="/terms" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
          Terms
        </Link>
        <span className="text-gray-600">|</span>
        <Link href="/privacy" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
          Privacy
        </Link>
        <span className="text-gray-600">|</span>
        <a href="https://x.com/bonkgang_fun" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
          Twitter
        </a>
        <span className="text-gray-600">|</span>
        <a href="https://x.com/home" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
          Communities
        </a>
      </div>
    </div>
  );
};

export default FooterLinks;