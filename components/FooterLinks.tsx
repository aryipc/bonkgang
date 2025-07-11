
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface FooterLinksProps {
  onReset: () => void;
}

const FooterLinks: React.FC<FooterLinksProps> = ({ onReset }) => {
  const [resetStatus, setResetStatus] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleResetIp = async () => {
    setIsResetting(true);
    setResetStatus('');
    try {
      const response = await fetch('/api/reset-ip', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset.');
      }
      setResetStatus(data.message);
      // After a successful reset, call the onReset callback passed from the parent 
      // page to re-fetch the user's status without a full page reload.
      setTimeout(() => {
        onReset();
        // Clear the message after the reset is complete
        setResetStatus('');
      }, 2000); 

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResetStatus(`Error: ${message}`);
    } finally {
      // Re-enable the button after the process is finished.
      setTimeout(() => setIsResetting(false), 2000);
    }
  };

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
      {/* Test Section */}
      <div className="mt-6 text-center">
        <button 
          onClick={handleResetIp} 
          disabled={isResetting}
          className="text-xs px-4 py-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors disabled:cursor-not-allowed disabled:text-gray-600 disabled:opacity-50"
        >
          {isResetting ? 'Resetting...' : 'Reset Submissions (Test)'}
        </button>
        {resetStatus && <p className="text-xs text-amber-300 mt-2 animate-fadeInUp">{resetStatus}</p>}
      </div>
    </div>
  );
};

export default FooterLinks;
