
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import FooterLinks from '@/components/FooterLinks';
import Loader from '@/components/Loader';
import { type GalleryEntry } from '@/app/api/lib/db';
import PaginationControls from '@/components/PaginationControls';

const styleNames: { [key: string]: string } = {
  og_bonkgang: 'OG BonkGang',
  ghz: 'GHZ',
  street_gang: 'Street Gang',
};

export default function GalleryPage() {
    const [entries, setEntries] = useState<GalleryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const mainRef = useRef<HTMLElement>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of gallery smoothly when page changes
        mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchGallery = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/gallery?page=${currentPage}&limit=24`, { cache: 'no-store' });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: "Failed to fetch gallery data." }));
                    throw new Error(errorData.message);
                }
                const data = await response.json();
                setEntries(data.entries);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGallery();
    }, [currentPage]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center mt-12"><Loader /></div>;
        }

        if (error) {
            return (
                <div className="mt-8 text-center p-4 bg-red-900/50 border border-red-400 rounded-md">
                    <p className="text-red-300">Could not load the gallery: {error}</p>
                </div>
            );
        }

        if (entries.length === 0) {
            return (
                <div className="mt-12 text-center text-gray-400">
                    <p>The Roll is currently empty.</p>
                    <p className="text-sm mt-2">Be the first to register a new member!</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {entries.map((entry) => (
                    <a
                        key={entry.id}
                        href={entry.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 animate-fadeInUp"
                    >
                        <div className="aspect-square w-full overflow-hidden">
                            <img
                                src={entry.imageUrl}
                                alt={`Gang member of ${styleNames[entry.gang] || 'Unknown Gang'}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                        <div className="p-3">
                            <p className="text-amber-400 font-bold text-sm truncate group-hover:text-amber-300">{styleNames[entry.gang] || 'Unknown Gang'}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(entry.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </a>
                ))}
            </div>
        );
    };

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <main ref={mainRef} className="w-full mt-8 scroll-mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-8 text-center">
            Roll of Members
          </h2>
          
          {renderContent()}
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <div className="text-center mt-12">
            <Link href="/" className="px-6 py-2 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[3px_3px_0px_#000] enabled:hover:bg-amber-500 enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none">
              Back to Register
            </Link>
          </div>
        </main>
        <FooterLinks />
        <footer className="mt-8 text-center text-xs text-gray-400">
            <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
